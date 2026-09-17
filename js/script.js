/* --- CONFIGURACIÓN DE HISTORIAS CON RUTAS REALES --- */
const historiasData = {
    // 18 láminas (.jpg)
    historia1: Array.from({ length: 18 }, (_, i) => `img/colores/colores1 (${i + 1}).jpg`),

    // 19 láminas (.png)
    historia2: Array.from({ length: 19 }, (_, i) => `img/ruta_ayuda/${i + 1}.png`)
};

let currentStoryImages = [];
let currentIndex = 0;

/* --- CONTROL DEL MODAL (SLIDER + MINIATURAS + FLECHAS) --- */
function openStory(id) {
    const modal = document.getElementById("storyModal");
    const container = document.getElementById("modalBody");
    const thumbs = document.getElementById("modalThumbs");
    const paginas = historiasData[id];

    if (!paginas || !modal || !container) return;

    currentStoryImages = paginas;
    currentIndex = 0;

    // 1. Cargar fotos principales
    container.innerHTML = paginas
        .map((src, i) => `<img src="${src}" alt="Página ${i + 1}" id="slide-${i}" loading="lazy">`)
        .join("");

    // 2. Cargar barra de miniaturas
    if (thumbs) {
        thumbs.innerHTML = paginas
            .map((src, i) => `<img src="${src}" alt="Miniatura ${i + 1}" class="thumb-item ${i === 0 ? 'active-thumb' : ''}" onclick="goToSlide(${i})">`)
            .join("");
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    container.scrollLeft = 0;

    // Sincronizar miniatura activa al deslizar manualmente
    container.onscroll = () => {
        const slideWidth = container.querySelector("img")?.clientWidth || 300;
        const newIndex = Math.round(container.scrollLeft / (slideWidth + 30));
        if (newIndex >= 0 && newIndex < currentStoryImages.length && newIndex !== currentIndex) {
            currentIndex = newIndex;
            updateActiveThumb(currentIndex);
        }
    };
}

function goToSlide(index) {
    const container = document.getElementById("modalBody");
    const target = document.getElementById(`slide-${index}`);
    if (container && target) {
        currentIndex = index;
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        updateActiveThumb(index);
    }
}

function nextSlide() {
    if (currentIndex < currentStoryImages.length - 1) {
        goToSlide(currentIndex + 1);
    }
}

function prevSlide() {
    if (currentIndex > 0) {
        goToSlide(currentIndex - 1);
    }
}

function updateActiveThumb(index) {
    const allThumbs = document.querySelectorAll(".thumb-item");
    allThumbs.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add("active-thumb");
            thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
            thumb.classList.remove("active-thumb");
        }
    });
}

function closeModal() {
    const modal = document.getElementById("storyModal");
    const container = document.getElementById("modalBody");
    const thumbs = document.getElementById("modalThumbs");
    
    if (modal) {
        modal.style.display = "none";
        if (container) container.innerHTML = "";
        if (thumbs) thumbs.innerHTML = "";
        document.body.style.overflow = "auto";
    }
}

/* --- EVENTOS GLOBALES DE LA WEB --- */
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. CONTROL DE VIDEOS (REELS + BARRA DE PROGRESO INTERACTIVA)
    const wrappers = document.querySelectorAll(".video-wrapper");

    wrappers.forEach(wrapper => {
        const video = wrapper.querySelector("video");
        const progressBar = wrapper.querySelector(".video-progress-bar");
        const progressFill = wrapper.querySelector(".video-progress-fill");
        if (!video) return;

        // Play / Pausa al tocar el área del video
        wrapper.addEventListener("click", (e) => {
            // Evitar que el clic en la barra de progreso pause el video
            if (e.target.closest(".video-progress-bar")) return;

            if (video.paused) {
                // Pausar cualquier otro video activo en la pantalla
                document.querySelectorAll(".video-wrapper video").forEach(other => {
                    if (other !== video) {
                        other.pause();
                        other.parentElement.classList.remove("is-playing");
                    }
                });

                video.play();
                wrapper.classList.add("is-playing");
            } else {
                video.pause();
                wrapper.classList.remove("is-playing");
            }
        });

        // Actualizar la línea de avance en tiempo real conforme avanza el video
        video.addEventListener("timeupdate", () => {
            if (video.duration && progressFill) {
                const percent = (video.currentTime / video.duration) * 100;
                progressFill.style.width = `${percent}%`;
            }
        });

        // Adelantar o retroceder al hacer clic o arrastrar en la barra
        if (progressBar) {
            progressBar.addEventListener("click", (e) => {
                e.stopPropagation();
                const rect = progressBar.getBoundingClientRect();
                const clickPosition = e.clientX - rect.left;
                const totalWidth = rect.width;
                const targetPercentage = clickPosition / totalWidth;
                
                if (video.duration) {
                    video.currentTime = targetPercentage * video.duration;
                }
            });
        }

        // Restaurar estado visual al finalizar
        video.addEventListener("ended", () => {
            wrapper.classList.remove("is-playing");
        });
    });

    // 2. CONTROLES DEL MODAL DE HISTORIAS (BOTONES Y FONDO)
    const prevBtn = document.getElementById("modalPrev");
    const nextBtn = document.getElementById("modalNext");
    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);

    const closeBtn = document.querySelector(".close-modal");
    const modal = document.getElementById("storyModal");

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Navegación con teclado (Escape para salir, flechas izquierda/derecha)
    document.addEventListener("keydown", (e) => {
        if (!modal || modal.style.display !== "flex") return;
        if (e.key === "Escape") closeModal();
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
    });

    // 3. FECHA EDITORIAL AUTOMÁTICA
    const dateElement = document.getElementById("current-date");
    if (dateElement) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.innerText = new Date().toLocaleDateString('es-ES', options).toUpperCase();
    }

    // 4. EFECTO REVEAL AL HACER SCROLL
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.article-card, #perfil, .story-item').forEach(el => {
        el.classList.add('reveal-hidden');
        observer.observe(el);
    });

    // 5. PARALAJE SUTIL EN EL HERO
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroText = document.querySelector('h1');
        if (heroText) {
            heroText.style.transform = `translateY(${scrolled * 0.15}px)`;
            heroText.style.opacity = 1 - (scrolled / 700);
        }
    });

    // 6. EFECTO DE SONIDO HOVER SUTIL
    const hoverSound = new Audio('https://www.soundjay.com/buttons/sounds/button-21.mp3');
    hoverSound.volume = 0.05;

    document.querySelectorAll('.grid-item, a, .read-more, .modal-arrow').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const s = hoverSound.cloneNode();
            s.volume = 0.05;
            s.play().catch(() => {});
        });
    });
});