/**
 * NOMAD PHOKUS - Motor Lógico Unificado (Versión Ultra-Cinematográfica)
 */

const translations = {
    es: {
        title: "Nomad Phokus | Grupo Fotográfico",
        welcome: "Nomad Phokus",
        svanBtn: "Svån Portfolio",
        phokusBtn: "PHOKUS Portfolio",
        aboutBtn: "Visión",
        contactBtn: "Contacto",
        aboutTitle: "Visión",
        aboutText: "Exploramos el límite entre lo cotidiano y lo extraordinario centrándonos en la identificación de momentos clave y, en ocasiones, reinterpretando elementos ordinarios que oscilan entre el registro documental y nuestra faceta más exótica con la finalidad de mostrar una narrativa visual fuera del sedentarismo creativo.",
        contactTitle: "Contacto",
        backBtn: "Volver",
        mailLabel: "Email"
    },
    en: {
        title: "Nomad Phokus | Photography Group",
        welcome: "Nomad Phokus",
        svanBtn: "Svån Portfolio",
        phokusBtn: "PHOKUS Portfolio",
        aboutBtn: "Vision",
        contactBtn: "Contact",
        aboutTitle: "Vision",
        aboutText: "We explore the boundary between the everyday and the extraordinary by focusing on the identification of key moments. At times, we reinterpret ordinary elements that range from documentary recording to our more exotic facets, aiming to present a visual storytelling that defies creative sedentarity.",
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
    
    // --- INTEGRACIÓN DE TÍTULO DINÁMICO ---
    if (displayName) {
        // Formatea el nombre para que sea "Phokus" o "Svan" (Primera Mayúscula)
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toUpperCase();
        document.title = `Portfolio | ${formattedName}`;
        
        // Mantiene el nombre en el HTML como PHOKUS/SVÅN (Todo Mayúsculas)
        if (nameSpan) nameSpan.innerText = displayName.toUpperCase();
    }

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

function crearEstructuraLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-visor';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-btn close-btn"><i class="fas fa-times"></i></button>
            <img class="lightbox-img" src="" alt="Gallery Image" draggable="false">
            <div class="lightbox-controls-bottom">
                <div class="controls-row">
                    <button class="lightbox-btn inline-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
                    <button class="play-pause-btn" id="play-btn"><i class="fas fa-play"></i></button>
                    <button class="lightbox-btn inline-btn next-btn"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="image-counter" id="counter">00 / 00</div>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector('.lightbox-img');
    let startX = 0, startY = 0;
    let isDragging = false;

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
            const opacity = 1 - Math.abs(diffY) / 600;
            const scale = 1 - Math.abs(diffY) / 2000;
            lbImg.style.transform = `translate(${diffX * 0.3}px, ${diffY}px) scale(${scale})`;
            lightbox.style.backgroundColor = `rgba(0, 0, 0, ${0.85 * opacity})`;
        } else {
            lbImg.style.transform = `translateX(${diffX}px)`;
        }
    };

    const endAction = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const endX = (e.type === 'mouseup') ? e.clientX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
        const endY = (e.type === 'mouseup') ? e.clientY : (e.changedTouches ? e.changedTouches[0].clientY : startY);
        
        const diffX = endX - startX;
        const diffY = endY - startY;
        const threshold = 70;

        lbImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease';

        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > threshold) {
            lbImg.style.transform = `translateY(${diffY > 0 ? '100%' : '-100%'})`;
            lbImg.style.opacity = '0';
            setTimeout(closeLightbox, 300);
        } else if (Math.abs(diffX) > threshold) {
            stopSlideshow();
            lbImg.style.opacity = '0';
            lbImg.style.transform = `translateX(${diffX > 0 ? '100%' : '-100%'})`;
            
            setTimeout(() => {
                diffX > 0 ? prevImg() : nextImg();
            }, 400);
        } else {
            lbImg.style.transform = 'translate(0, 0) scale(1)';
            lbImg.style.opacity = '1';
            lightbox.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        }
    };

    lightbox.addEventListener('touchstart', startAction, { passive: true });
    lightbox.addEventListener('touchmove', moveAction, { passive: false });
    lightbox.addEventListener('touchend', endAction, { passive: true });

    lbImg.addEventListener('mousedown', startAction);
    window.addEventListener('mousemove', moveAction);
    window.addEventListener('mouseup', endAction);
}

function updateLightbox(direction = 'none') {
    const lbImg = document.querySelector('.lightbox-img');
    const lbCounter = document.getElementById('counter');
    if (!lbImg || galleryImages.length === 0) return;

    if (direction !== 'none' && lbImg.style.opacity !== '0') {
        lbImg.style.transition = 'transform 0.4s ease-in, opacity 0.3s ease-in';
        lbImg.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;
        lbImg.style.opacity = '0';
        
        setTimeout(() => ejecutarCambioImagen(lbImg, lbCounter, direction), 400);
    } else {
        ejecutarCambioImagen(lbImg, lbCounter, direction);
    }
}

function ejecutarCambioImagen(lbImg, lbCounter, direction) {
    const tempImg = new Image();
    tempImg.src = galleryImages[currentIndex];

    tempImg.onload = () => {
        lbImg.style.transition = 'none';
        
        if (direction === 'next') lbImg.style.transform = 'translateX(100%)';
        else if (direction === 'prev') lbImg.style.transform = 'translateX(-100%)';
        else lbImg.style.transform = 'translateX(0)';

        lbImg.src = galleryImages[currentIndex];

        void lbImg.offsetWidth;

        lbImg.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease-out';
        lbImg.style.transform = 'translateX(0)';
        lbImg.style.opacity = '1';
        
        lbCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(galleryImages.length).padStart(2, '0')}`;
    };
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