document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contacto form');
    if (!contactForm) return;

    const toggleButtons = contactForm.querySelectorAll('.toggle-btn');
    const asuntoInput = document.getElementById('asunto-input');
    const textarea = contactForm.querySelector('textarea');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    // Éléments du nouveau Popup
    const successPopup = document.getElementById('success-popup');
    const closePopupBtn = successPopup ? successPopup.querySelector('.close-popup-btn') : null;
    let popupTimer;

    // 1. Messages préremplis
    const defaultMessages = {
        eventos: "Hola Diana, me interesa obtener información y una cotización para la música de un evento especial. ¡Quedo atento!",
        clases: "Hola Diana, estoy interesado en tus clases de canto. Me gustaría recibir más detalles sobre las modalidades, horarios y costos disponibles. ¡Gracias!"
    };

    if (textarea && !textarea.value) {
        textarea.value = defaultMessages.eventos;
    }

    // 2. Gestion de la bascule des boutons d'options
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const value = this.getAttribute('data-value');
            asuntoInput.value = value;

            if (textarea) {
                const currentText = textarea.value.trim();
                if (currentText === "" || currentText === defaultMessages.eventos || currentText === defaultMessages.clases) {
                    textarea.value = defaultMessages[value];
                }
            }
        });
    });

    // 3. Fonctions du Popup
    // 3. Fonctions du Popup
    function openSuccessPopup() {
        if (!successPopup) return;
        successPopup.classList.add('active');

        // --- NOUVEAU : FEU D'ARTIFICE DE CONFETTIS ---
        // On vérifie que la librairie est bien chargée
        if (typeof confetti === 'function') {
            var duration = 2000; // Le feu d'artifice dure 2 secondes
            var end = Date.now() + duration;

            (function frame() {
                // Canon de gauche
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#AF4D98', '#D66BA0', '#E5A9A9', '#F4E4BA'], // Les couleurs de Diana !
                    zIndex: 100001 // S'assure qu'ils passent au-dessus du popup
                });
                // Canon de droite
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#F4E4BA', '#D66BA0', '#E5A9A9', '#AF4D98'],
                    zIndex: 100001
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }

        // Fermeture automatique après 3 secondes (on laisse le temps d'admirer l'animation !)
        popupTimer = setTimeout(closeSuccessPopup, 3000);
    }

    function closeSuccessPopup() {
        if (!successPopup) return;
        successPopup.classList.remove('active');
        clearTimeout(popupTimer); // On nettoie le timer si fermé manuellement avant les 2s
    }

    // Événements de fermeture du popup
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', closeSuccessPopup);
    }
    if (successPopup) {
        // Permet de fermer si l'utilisateur clique n'importe où sur le fond sombre
        successPopup.addEventListener('click', (e) => {
            if (e.target === successPopup) closeSuccessPopup();
        });
    }

    // 4. Envoi du formulaire (Web3Forms)
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        formData.append("access_key", "06489074-e723-4b4e-938f-3f47139816ee"); // access key
        formData.append("from_name", "Web Diana Lara");
        formData.append("subject", `[Web] Nuevo mensaje sobre: ${asuntoInput.value}`);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // On affiche notre superbe popup personnalisé !
                openSuccessPopup();
                contactForm.reset();
                textarea.value = defaultMessages[asuntoInput.value];
            } else {
                alert("Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Error de conexión. Inténtalo más tarde.");
        })
        .finally(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
    });
});