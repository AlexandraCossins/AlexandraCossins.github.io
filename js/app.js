document.addEventListener('DOMContentLoaded', () => {
    // Dark / Light Theme Toggle & Automatic System Preference
    const initTheme = () => {
        const themeToggleBtn = document.getElementById('theme-toggle');
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const getEffectiveTheme = () => {
            const currentAttr = document.documentElement.getAttribute('data-theme');
            if (currentAttr) return currentAttr;
            return mediaQuery.matches ? 'dark' : 'light';
        };

        const updateToggleButtonState = (theme) => {
            if (!themeToggleBtn) return;
            const isDark = theme === 'dark';
            themeToggleBtn.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
            themeToggleBtn.setAttribute('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        };

        // Initialize button accessibility attributes
        updateToggleButtonState(getEffectiveTheme());

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                const currentTheme = getEffectiveTheme();
                const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', nextTheme);
                try {
                    localStorage.setItem('theme', nextTheme);
                } catch (e) {
                    console.error('No se pudo guardar la preferencia de tema', e);
                }
                updateToggleButtonState(nextTheme);
            });
        }

        // React immediately if device preference changes in real time
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                updateToggleButtonState(e.matches ? 'dark' : 'light');
            }
        });
    };

    initTheme();
    // Hide Loader
    const loader = document.querySelector('.loader');
    setTimeout(() => {
        loader.classList.add('hide');
        
        // Trigger initial hero animations after loader hides
        setTimeout(() => {
            document.querySelector('.hero-content').classList.add('active');
        }, 300);
    }, 1500);

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Solución al lag del hover: eliminar el delay una vez que ha aparecido
                if (entry.target.style.transitionDelay) {
                    setTimeout(() => {
                        entry.target.style.transitionDelay = '';
                    }, 1500); // Esperar a que termine la animación de entrada
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to observe
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // Optional: Carousel Drag to Scroll behavior (for desktop)
    const carousel = document.querySelector('.carousel-track');
    let isDown = false;
    let startX;
    let scrollLeft;

    if(carousel) {
        carousel.addEventListener('mousedown', (e) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        carousel.addEventListener('mouseleave', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mouseup', () => {
            isDown = false;
            carousel.style.cursor = 'grab';
        });
        carousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            carousel.scrollLeft = scrollLeft - walk;
        });
    }

    // Inicializar Swiper para las tarjetas
    if (typeof Swiper !== 'undefined') {
        const swiperInstances = [];
        const cubeSwipers = document.querySelectorAll('.cube-swiper');
        
        cubeSwipers.forEach(swiperEl => {
            const instance = new Swiper(swiperEl, {
                grabCursor: true,
                speed: 1000, /* Transición suave */
                loop: true
            });
            swiperInstances.push(instance);
        });

        // Controlar el cambio de todas las tarjetas a la vez (sincronizado)
        setInterval(() => {
            swiperInstances.forEach(swiper => {
                if (swiper && !swiper.destroyed) {
                    swiper.slideNext();
                }
            });
        }, 5000);
    }

    // Lightbox Logic for Galleries
    const createLightbox = () => {
        const lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML = `
            <div class="lightbox-close"><i class="fa-solid fa-xmark"></i></div>
            <div class="lightbox-content"></div>
        `;
        document.body.appendChild(lb);

        lb.addEventListener('click', (e) => {
            if (e.target === lb || e.target.closest('.lightbox-close')) {
                lb.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lb.classList.contains('active')) {
                lb.classList.remove('active');
            }
        });

        return lb;
    };

    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length > 0) {
        const lightbox = createLightbox();
        const lightboxContent = lightbox.querySelector('.lightbox-content');

        galleryItems.forEach(item => {
            item.style.cursor = 'zoom-in';
            item.addEventListener('click', (e) => {
                if (e.target.tagName.toLowerCase() === 'a') return;

                const img = item.querySelector('img').cloneNode(true);
                const caption = item.querySelector('.polaroid-caption');
                
                lightboxContent.innerHTML = '';
                lightboxContent.appendChild(img);
                
                if (caption) {
                    const captionClone = caption.cloneNode(true);
                    lightboxContent.appendChild(captionClone);
                }
                
                lightbox.classList.add('active');
            });
        });
    }

    // Gallery Subcategory Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const subcategoryPolaroids = document.querySelectorAll('.subcategory-polaroid');

    if (filterButtons.length > 0 || subcategoryPolaroids.length > 0) {
        const filterGallery = (filterValue) => {
            // Update filter button states
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-filter') === filterValue) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Filter photo items
            const currentItems = document.querySelectorAll('.gallery-item');
            currentItems.forEach(item => {
                const itemCat = item.getAttribute('data-category');
                if (filterValue === 'all' || itemCat === filterValue) {
                    item.style.display = 'inline-block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 20);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                filterGallery(filter);
            });
        });

        subcategoryPolaroids.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = card.getAttribute('data-filter');
                if (filter) {
                    filterGallery(filter);
                    const photosSection = document.getElementById('gallery-photos');
                    if (photosSection) {
                        photosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }
});
