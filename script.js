document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // --- 1. ANIMATIONS D'APPARITION AU SCROLL ---
    // ==========================================
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => revealOnScroll.observe(reveal));

    // ==========================================
    // --- 2. CALCULATEUR DE PRIX DYNAMIQUE (Servicios) ---
    // ==========================================
    const btnCalcular = document.getElementById('btn-calcular');
    const selectEvento = document.getElementById('evento');
    const selectHoras = document.getElementById('horas');
    const precioTotal = document.getElementById('precio-total');

    // Objet qui stockera les données du Google Sheet
    let datosServicios = {};

    // ⚠️ INSÈRE TON LIEN CSV GOOGLE SHEET ICI :
    const urlCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQuxIpVgykxljfR4XnTu4KaQ59K55rTpyxJCzBD4IZj6M52ekB1FsO0PTsg_m6EpRS04coehvBCnVj6/pub?gid=0&single=true&output=csv";

    if (selectEvento && btnCalcular) {
        
        async function cargarCotizador() {
            try {
                // 1. État de chargement
                selectEvento.innerHTML = '<option value="">Cargando opciones...</option>';
                btnCalcular.disabled = true; 

                // 2. Récupération des données du fichier CSV
                const response = await fetch(urlCSV);
                const dataText = await response.text();
                const lineas = dataText.split('\n');

                // 3. Nettoyage du menu déroulant
                selectEvento.innerHTML = '';

                // 4. Création des options à partir du Sheet
                lineas.forEach(linea => {
                    const cols = linea.split(',');

                    // S'il y a bien 4 colonnes
                    if (cols.length >= 4) {
                        const id = cols[0].trim();
                        const nombre = cols[1].trim();
                        const costoBase = parseInt(cols[2].trim(), 10);
                        const costoPorHora = parseInt(cols[3].trim(), 10);

                        // Si c'est bien des chiffres (ça permet d'ignorer la ligne d'en-tête du tableau)
                        if (!isNaN(costoBase) && !isNaN(costoPorHora)) {
                            
                            // On sauvegarde les prix en mémoire
                            datosServicios[id] = { base: costoBase, hora: costoPorHora };

                            // On fabrique l'option pour le HTML
                            const option = document.createElement('option');
                            option.value = id;
                            option.textContent = nombre;
                            selectEvento.appendChild(option);
                        }
                    }
                });

                // Le chargement est fini, on réactive le bouton
                btnCalcular.disabled = false;

            } catch (error) {
                console.error("Erreur de connexion au Google Sheet :", error);
                selectEvento.innerHTML = '<option value="">Error de conexión</option>';
            }
        }

        // On déclenche la fonction au chargement de la page
        cargarCotizador();

        // 5. Calcul lors du clic sur le bouton
        btnCalcular.addEventListener('click', () => {
            const tipo = selectEvento.value;
            const horas = parseInt(selectHoras.value);

            // On va chercher les prix fraîchement téléchargés
            if (datosServicios[tipo]) {
                const costoBase = datosServicios[tipo].base;
                const costoPorHora = datosServicios[tipo].hora;

                const total = costoBase + (costoPorHora * horas);
                
                // Petite animation de pop
                precioTotal.style.transform = "scale(1.1)";
                setTimeout(() => { precioTotal.style.transform = "scale(1)"; }, 200);
                
                precioTotal.textContent = '$ ' + total.toLocaleString('es-MX') + ' MXN';
            }
        });
    }

    // ==========================================
    // --- 3. ACCORDÉON FAQ ---
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('open');
                });
                item.classList.toggle('open');
            });
        }
    });

    // ==========================================
    // --- 5. LECTEUR AUDIO GLOBAL ET PERSISTANT ---
    // ==========================================
    const globalAudio = document.getElementById('voz-audio');
    const btnAudioToggle = document.getElementById('audio-toggle-header');
    const btnStartExp = document.getElementById('start-experience');
    
    // NOUVEAU : On récupère TOUS les boutons "Escuchar mi voz" ajoutés sur le site
    const extraAudioBtns = document.querySelectorAll('.btn-play-global');
    
    let hasStartedExp = sessionStorage.getItem('experienceStarted') === 'true';

    if (globalAudio) {
        
        const audioIconImg = btnAudioToggle ? btnAudioToggle.querySelector('.audio-icon-img') : null;
        
        globalAudio.volume = 0.2; 
        
        if (hasStartedExp && btnAudioToggle) {
            btnAudioToggle.classList.remove('hidden-audio-btn');
        }

        const isPlaying = sessionStorage.getItem('audioPlaying') === 'true';
        const savedTime = sessionStorage.getItem('audioTime');

        if (savedTime) {
            globalAudio.currentTime = parseFloat(savedTime);
        }

        if (isPlaying) {
            globalAudio.play().then(() => {
                if (audioIconImg) audioIconImg.src = 'img/pausa.png';
            }).catch(e => {
                sessionStorage.setItem('audioPlaying', 'false');
                if (audioIconImg) audioIconImg.src = 'img/play.png';
            });
        } else {
            if (audioIconImg) audioIconImg.src = 'img/play.png';
        }

        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('audioTime', globalAudio.currentTime);
            sessionStorage.setItem('audioPlaying', !globalAudio.paused);
        });

        // Fonction Centrale pour alterner Lecture/Pause
        function toggleAudio() {
            sessionStorage.setItem('experienceStarted', 'true');
            hasStartedExp = true;
            if (btnAudioToggle) btnAudioToggle.classList.remove('hidden-audio-btn');

            if (globalAudio.paused) {
                globalAudio.play();
                sessionStorage.setItem('audioPlaying', 'true');
                if (audioIconImg) audioIconImg.src = 'img/pausa.png';
            } else {
                globalAudio.pause();
                sessionStorage.setItem('audioPlaying', 'false');
                if (audioIconImg) audioIconImg.src = 'img/play.png';
            }
        }

        // Clic sur le bouton du header
        if (btnAudioToggle) {
            btnAudioToggle.addEventListener('click', toggleAudio);
        }

        // Clic sur le gros bouton "Comenzar" (Page Mi Voz)
        if (btnStartExp) {
            btnStartExp.addEventListener('click', () => {
                if (globalAudio.paused) toggleAudio();
                const immersiveGallery = document.getElementById('immersive-gallery');
                if (immersiveGallery) immersiveGallery.scrollIntoView({ behavior: 'smooth' });
            });
        }

        // NOUVEAU : Clic sur n'importe quel bouton ".btn-play-global" n'importe où dans le site
        extraAudioBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Empêche la page de remonter si c'est une balise <a>
                toggleAudio(); // Lance ou met en pause la musique
            });
        });
        
        // Gestion dynamique du volume au scroll (Uniquement sur la page Mi Voz)
        const immersiveGallery = document.getElementById('immersive-gallery');
        if (immersiveGallery) {
            window.addEventListener('scroll', () => {
                if (!hasStartedExp || globalAudio.paused) return;
                
                const scrollY = window.scrollY;
                const maxScrollPourVolume = 1500; 
                
                let dynamicVolume = (scrollY / maxScrollPourVolume) * 0.8;
                dynamicVolume = Math.max(0.05, Math.min(dynamicVolume, 0.8));
                
                globalAudio.volume = dynamicVolume;
            });
        }
    }

    // ==========================================
    // --- 6. ANIMATIONS IMMERSIVES DES IMAGES ---
    // ==========================================
    const slideItems = document.querySelectorAll('.slide-item');
    
    if (slideItems.length > 0) {
        const slideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -100px 0px"
        });

        slideItems.forEach(item => slideObserver.observe(item));
    }

    
    // ==========================================
    // --- 7. SLIDER FLUX VIDÉO (Navigation & Modal Plein Écran) ---
    // ==========================================
    const sliderSection = document.querySelector('.blob-slider-section');
    const sliderWrapper = document.getElementById('flow-slider-wrapper');
    const sliderTrack = document.getElementById('flow-slider-track');

    if (sliderWrapper && sliderTrack && sliderSection) {
        let isPaused = false;
        const videoItems = document.querySelectorAll('.video-item');

        // --- NOUVEAU : Création du Modal dynamique dans le body ---
        const videoModal = document.createElement('div');
        videoModal.classList.add('video-modal-overlay');
        videoModal.innerHTML = `
            <div class="video-modal-content">
                <video controls autoplay playsinline></video>
                <button class="close-modal-btn">✖</button>
            </div>
        `;
        document.body.appendChild(videoModal);
        
        const modalVideoEl = videoModal.querySelector('video');
        const closeModalBtn = videoModal.querySelector('.close-modal-btn');

        // Fonction pour fermer proprement le modal
        function closeModal() {
            videoModal.classList.remove('active');
            modalVideoEl.pause();
            modalVideoEl.src = ''; // On vide la source pour arrêter le chargement
            sliderSection.classList.remove('is-paused'); // Relance le blob
            isPaused = false; // Relance le slider JS
        }

        // Fermer en cliquant sur le fond noir ou la croix
        videoModal.addEventListener('click', (e) => {
            if(e.target === videoModal || e.target === closeModalBtn) {
                closeModal();
            }
        });

        // 1. Gestion des clics et survols sur les vidéos du slider
        videoItems.forEach(item => {
            const vid = item.querySelector('video');
            
            if(vid) {
                // Lecture miniature au survol
                item.addEventListener('mouseenter', () => {
                    if (!isPaused) vid.play().catch(e => {});
                });
                
                // Pause miniature quand on quitte
                item.addEventListener('mouseleave', () => {
                    vid.pause();
                    vid.currentTime = 0; 
                });

                // Clic : Ouvre la vidéo en grand dans le modal
                item.addEventListener('click', () => {
                    sliderSection.classList.add('is-paused');
                    isPaused = true;
                    
                    vid.pause(); // Coupe la miniature
                    
                    // Transfère la vidéo dans le modal et l'affiche
                    modalVideoEl.src = vid.src;
                    videoModal.classList.add('active');
                    modalVideoEl.play().catch(e => {});
                });
            }
        });

        // 2. Gestion de l'animation de défilement à la souris
        let targetX = 0;   
        let currentX = 0;  

        sliderWrapper.addEventListener('mousemove', (e) => {
            if (isPaused) return; // Bloque la navigation si le modal est ouvert
            
            const windowWidth = window.innerWidth;
            const trackWidth = sliderTrack.scrollWidth;
            if (trackWidth <= windowWidth) return;

            const maxScroll = trackWidth - windowWidth + (windowWidth * 0.2); 
            const mousePercent = e.clientX / windowWidth;
            targetX = -(mousePercent * maxScroll);
        });

        function animateFlowSlider() {
            if (!isPaused && window.innerWidth > 850) {
                currentX += (targetX - currentX) * 0.05; 
                sliderTrack.style.transform = `translateX(${currentX}px)`;
            }
            requestAnimationFrame(animateFlowSlider);
        }
        
        animateFlowSlider();
    }
    // ==========================================
    // --- 8. GESTION DU MENU BURGER MOBILE ---
    // ==========================================
    const burgerBtn = document.getElementById('burger-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = mainNav ? mainNav.querySelectorAll('a') : [];

    if (burgerBtn && mainNav) {
        // Au clic sur le bouton burger : on intervertit les états
        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Évite la fermeture instantanée
            burgerBtn.classList.toggle('open');
            mainNav.classList.toggle('mobile-open');
        });

        // Fermer automatiquement le menu si l'utilisateur clique sur un lien de navigation
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('open');
                mainNav.classList.remove('mobile-open');
            });
        });

        // Fermer le menu si l'utilisateur clique n'importe où en dehors du menu sur la page
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !burgerBtn.contains(e.target)) {
                burgerBtn.classList.remove('open');
                mainNav.classList.remove('mobile-open');
            }
        });
    }
});