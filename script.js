/**
 * NOMAD PHOKUS - Motor Lógico Unificado (Multiformato & Toggle)
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

document.addEventListener('DOMContentLoaded', () => {
    configurarIdioma();

    const params = new URLSearchParams(window.location.search);
    const cloudUser = params.get('user');
    const displayName = params.get('name');

    if (cloudUser && document.getElementById('grid-fotografico')) {
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
                    // --- CAMBIO: CREACIÓN DE ENLACE PARA IPHONE ---
                    const linkElement = document.createElement('a');
                    const fullRes = imgURL.replace('w_1200', 'q_auto').split('?')[0];
                    linkElement.href = fullRes;
                    linkElement.target = "_blank";
                    linkElement.rel = "opener"; // <--- Crucial para el botón "atrás" en iOS
                    linkElement.classList.add('grid-item-link');

                    const imgElement = document.createElement('img');
                    imgElement.src = imgURL;
                    imgElement.loading = "lazy";
                    imgElement.onload = () => imgElement.classList.add('reveal');
                    
                    linkElement.appendChild(imgElement);
                    grid.appendChild(linkElement);

                    imagenEncontrada = true;
                    i++; 
                    break; 
                }
            } catch (e) { continue; }
        }

        if (!imagenEncontrada) {
            console.log(`🔎 Galería cargada hasta la imagen: image-${i-1}`);
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