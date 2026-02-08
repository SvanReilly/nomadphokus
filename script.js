/**
 * NOMAD PHOKUS - Motor Lógico Unificado (Versión Ultra-Cinematográfica)
 */

const translations = {
    es: {
        welcome: "Nomad Phokus",
        svanBtn: "Svån Portfolio",
        phokusBtn: "PHOKUS Portfolio",
        aboutBtn: "Quiénes somos",
        contactBtn: "Contacto",
        aboutTitle: "Quiénes somos",
        aboutText: "Un colectivo visual dedicado a capturar la esencia de lo efímero a través de la fotografía nómada.",
        contactTitle: "Contacto",
        backBtn: "Volver",
        mailLabel: "Email"
    },
    en: {
        welcome: "Nomad Phokus",
        svanBtn: "Svån Portfolio",
        phokusBtn: "PHOKUS Portfolio",
        aboutBtn: "About Us",
        contactBtn: "Contact",
        aboutTitle: "About Us",
        aboutText: "A visual collective dedicated to capturing the essence of the ephemeral through nomadic photography.",
        contactTitle: "Contact",
        backBtn: "Back",
        mailLabel: "Email"
    }
};

const FOLDER = ""; 
const FORMATS = ['avif', 'webp', 'jpg', 'jpeg', 'png']; 
let galleryImages = []; 
let currentIndex = 0;
let slideInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    configurarIdioma();

    const params = new URLSearchParams(window.location.search);
    const cloudUser = params.get('user');
    const displayName = params.get('name');

    if (cloudUser && document.getElementById('grid-fotografico')) {
        crearEstructuraLightbox();
        inicializarGaleria(cloudUser, displayName);
    } else {
        configurarIntercambioSecciones();
        configurarCopiadoEmail();
    }
});

function configurarIdioma() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    langSelect.addEventListener('change', (e) => {
        const lang = e.target.value;
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[lang] && translations[lang][key]) {
                element.innerText = translations[lang][key];
            }
        });
        localStorage.setItem('pref-lang', lang);
    });

    const savedLang = localStorage.getItem('pref-lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
    langSelect.value = savedLang;
    langSelect.dispatchEvent(new Event('change'));
}

async function inicializarGaleria(cloudUser, displayName) {
    const nameSpan = document.getElementById('user-name');
    const grid = document.getElementById('grid-fotografico');
    if (nameSpan && displayName) nameSpan.innerText = displayName.toUpperCase();

    let i = 1; 
    let buscando = true;
    const ts = new Date().getTime();

    while (buscando && i < 100) {
        let imagenEncontrada = false;

        for (const ext of FORMATS) {
            const imgURL = `https://res.cloudinary.com/${cloudUser}/image/upload/f_auto,q_auto,w_1200/${FOLDER}/image-${i}.${ext}?v=${ts}`;
            
            try {
                const existe = await verificarExistencia(imgURL);
                if (existe) {
                    const fullRes = imgURL.replace('w_1200', 'q_auto').split('?')[0];
                    galleryImages.push(fullRes);

                    const item = document.createElement('div');
                    item.classList.add('grid-item-link');
                    item.dataset.index = galleryImages.length - 1;

                    const imgElement = document.createElement('img');
                    imgElement.src = imgURL;
                    imgElement.loading = "lazy";
                    imgElement.onload = () => imgElement.classList.add('reveal');
                    
                    item.appendChild(imgElement);
                    item.addEventListener('click', () => openLightbox(parseInt(item.dataset.index)));
                    
                    grid.appendChild(item);

                    imagenEncontrada = true;
                    i++; 
                    break; 
                }
            } catch (e) { continue; }
        }

        if (!imagenEncontrada) {
            buscando = false;
        }
    }
}

function verificarExistencia(url) {
    return new Promise((resolve) => {
        const test = new Image();
        test.onload = () => resolve(true);
        test.onerror = () => resolve(false);
        test.src = url;
    });
}

// --- LÓGICA DEL VISOR (TRACKING & GESTOS) ---

function crearEstructuraLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-visor';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-btn close-btn"><i class="fas fa-times"></i></button>
            <button class="lightbox-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
            <img class="lightbox-img" src="" alt="Gallery Image" draggable="false">
            <button class="lightbox-btn next-btn"><i class="fas fa-chevron-right"></i></button>
            <div class="lightbox-controls-bottom">
                <button class="play-pause-btn" id="play-btn"><i class="fas fa-play"></i></button>
                <div class="image-counter" id="counter">00 / 00</div>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.lightbox-img');
    let startX = 0, startY = 0;
    let isDragging = false;

    // --- LÓGICA DE CIERRE Y BOTONES ---
    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) closeLightbox();
    };
    lightbox.querySelector('.close-btn').onclick = closeLightbox;
    lightbox.querySelector('.next-btn').onclick = (e) => { e.stopPropagation(); stopSlideshow(); nextImg(); };
    lightbox.querySelector('.prev-btn').onclick = (e) => { e.stopPropagation(); stopSlideshow(); prevImg(); };
    lightbox.querySelector('#play-btn').onclick = (e) => { e.stopPropagation(); toggleSlideshow(); };
    
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") { stopSlideshow(); nextImg(); }
        if (e.key === "ArrowLeft") { stopSlideshow(); prevImg(); }
        if (e.key === " ") { e.preventDefault(); toggleSlideshow(); }
    });

    // --- TRACKING UNIFICADO (TACTIL Y RATÓN) ---
    const startAction = (e) => {
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        lbImg.style.transition = 'none';
    };

    const moveAction = (e) => {
        if (!isDragging) return;
        const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        if (Math.abs(diffY) > Math.abs(diffX)) {
            // Arrastre Vertical (Descarte)
            const opacity = 1 - Math.abs(diffY) / 600;
            const scale = 1 - Math.abs(diffY) / 2000;
            lbImg.style.transform = `translate(${diffX}px, ${diffY}px) scale(${scale})`;
            lightbox.style.backgroundColor = `rgba(0, 0, 0, ${0.7 * opacity})`;
        } else {
            // Arrastre Horizontal (Navegación)
            lbImg.style.transform = `translateX(${diffX}px)`;
        }
    };

    const endAction = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
        const endY = e.type.includes('touch') ? e.changedTouches[0].clientY : e.clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        const threshold = 100;

        lbImg.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease';

        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > threshold) {
            // CERRAR
            lbImg.style.transform = `translateY(${diffY > 0 ? '100%' : '-100%'})`;
            lbImg.style.opacity = '0';
            setTimeout(closeLightbox, 300);
        } else if (Math.abs(diffX) > threshold) {
            // NAVEGAR
            stopSlideshow();
            diffX > 0 ? prevImg() : nextImg();
        } else {
            // RESET (Vuelve al centro)
            lbImg.style.transform = 'translate(0, 0) scale(1)';
            lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        }
    };

    // Eventos Táctiles
    lightbox.addEventListener('touchstart', startAction, { passive: true });
    lightbox.addEventListener('touchmove', moveAction, { passive: false });
    lightbox.addEventListener('touchend', endAction, { passive: true });

    // Eventos Ratón
    lbImg.addEventListener('mousedown', startAction);
    window.addEventListener('mousemove', moveAction);
    window.addEventListener('mouseup', endAction);
}

function updateLightbox(direction = 'none') {
    const lbImg = document.querySelector('.lightbox-img');
    const lbCounter = document.getElementById('counter');
    const lightbox = document.getElementById('lightbox-visor');
    if (!lbImg || galleryImages.length === 0) return;

    // Resetear estilos de tracking
    lbImg.style.opacity = '1';
    lbImg.style.transform = 'translate(0, 0) scale(1)';
    lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    if (direction === 'none') {
        lbImg.src = galleryImages[currentIndex];
    } else {
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

        lbImg.classList.add(outClass);
        setTimeout(() => {
            lbImg.classList.remove(outClass);
            lbImg.src = galleryImages[currentIndex];
            lbImg.style.transition = 'none';
            lbImg.classList.add(inClass);
            void lbImg.offsetWidth;
            lbImg.style.transition = ''; 
            requestAnimationFrame(() => {
                lbImg.classList.remove(inClass);
            });
        }, 450);
    }
    lbCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
}

function openLightbox(index) {
    currentIndex = index;
    updateLightbox('none');
    document.getElementById('lightbox-visor').classList.add('active');
    document.body.style.overflow = 'hidden';
    startSlideshow();
}

function closeLightbox() {
    const visor = document.getElementById('lightbox-visor');
    if (visor) visor.classList.remove('active');
    document.body.style.overflow = 'auto';
    stopSlideshow();
}

function nextImg() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightbox('next');
}

function prevImg() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox('prev');
}

function toggleSlideshow() {
    if (slideInterval) stopSlideshow();
    else startSlideshow();
}

function startSlideshow() {
    if (slideInterval) return; 
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.style.background = "#fff";
        playBtn.style.color = "#000";
    }
    slideInterval = setInterval(nextImg, 5000);
}

function stopSlideshow() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
        const playBtn = document.getElementById('play-btn');
        if(playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.style.background = "rgba(255, 255, 255, 0.05)";
            playBtn.style.color = "#fff";
        }
    }
}

// --- RESTO DE FUNCIONES (INTERCAMBIO Y COPIADO) ---

function configurarIntercambioSecciones() {
    const btnNosotros = document.querySelector('[href="#nosotros"]');
    const btnContacto = document.querySelector('[href="#contacto"]');
    const secNosotros = document.getElementById('nosotros');
    const secContacto = document.getElementById('contacto');

    function toggleSection(target, other) {
        if (!target.classList.contains('hidden')) {
            target.classList.add('hidden');
        } else {
            other.classList.add('hidden');
            target.classList.remove('hidden');
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (btnNosotros && btnContacto) {
        btnNosotros.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSection(secNosotros, secContacto);
        });

        btnContacto.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSection(secContacto, secNosotros);
        });
    }
}

function configurarCopiadoEmail() {
    const emailLink = document.getElementById('email-copy');
    const tooltip = document.getElementById('copy-tooltip');
    const emailText = document.getElementById('email-text');

    if (emailLink && tooltip && emailText) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(emailText.innerText).then(() => {
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 2000);
            });
        });
    }
}