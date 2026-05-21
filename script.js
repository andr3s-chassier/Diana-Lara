document.addEventListener('DOMContentLoaded', () => {
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
    // --- SCRIPT DU CALCULATEUR ---
    const btnCalcular = document.getElementById('btn-calcular');
    const selectEvento = document.getElementById('evento');
    const selectHoras = document.getElementById('horas');
    const precioTotal = document.getElementById('precio-total');

    if(btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            const tipo = selectEvento.value;
            const horas = parseInt(selectHoras.value);
            
            let costoBase = 0;
            let costoPorHora = 0;

            // DONNÉES FICTIVES (À modifier plus tard)
            if (tipo === 'boda') {
                costoBase = 3000;      // Frais de base (déplacement, installation...)
                costoPorHora = 1500;   // Prix par heure
            } else if (tipo === 'recepcion') {
                costoBase = 2000;
                costoPorHora = 1200;
            } else if (tipo === 'recital') {
                costoBase = 4000;
                costoPorHora = 2000;
            }

            // Calcul
            const total = costoBase + (costoPorHora * horas);
            
            // Animation du texte pour montrer que ça a calculé
            precioTotal.style.transform = "scale(1.1)";
            setTimeout(() => { precioTotal.style.transform = "scale(1)"; }, 200);
            
            // Affichage avec formatage (ex: $ 7,500 MXN)
            precioTotal.textContent = '$ ' + total.toLocaleString('es-MX') + ' MXN';
        });
    }
    
    // --- SCRIPT DE L'ACCORDÉON FAQ ---
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Optionnel : Ferme les autres questions ouvertes quand on en clique une nouvelle
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) otherItem.classList.remove('open');
                });
                
                // Alterne l'état de la question cliquée
                item.classList.toggle('open');
            });
        }
    });
});