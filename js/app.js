document.addEventListener('DOMContentLoaded', () => {
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
});
