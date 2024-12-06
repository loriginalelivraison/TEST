document.addEventListener("DOMContentLoaded", () => {
    const switchButton = document.getElementById("language-switch");

    // Définir les traductions
    const translations = {
        fr: {
            headerTitle: "Choisissez votre catégorie",
            card1Title: "FROMAGERIE",
            card2Title: "Cosmétique",
            card3Title: "informatique mobile",
            card4Title: "CHOCOLAT",
        },
        ar: {
            headerTitle: "اختر الفئة الخاصة بك",
            card1Title: "منتجات الألبان",
            card2Title: "مستحضرات التجميل",
            card3Title: "المعلوماتية والهواتف",
            card4Title: "الشوكولاتة",
        }
    };

    // Lire la langue depuis le localStorage ou définir "fr" par défaut
    let currentLanguage = localStorage.getItem("language") || "fr";

    const updateText = (language) => {
        document.getElementById("header-title").textContent = translations[language].headerTitle;
        document.getElementById("card1-title").textContent = translations[language].card1Title;
        document.getElementById("card2-title").textContent = translations[language].card2Title;
        document.getElementById("card3-title").textContent = translations[language].card3Title;
        document.getElementById("card4-title").textContent = translations[language].card4Title;

        // Mettre à jour la direction et le bouton
        document.body.className = language === "ar" ? "ar" : "";
        document.documentElement.lang = language; // Définir l'attribut `lang`
        switchButton.textContent = language === "ar" ? "🛎️ Français" : "🛎️ عربي";
    };

    // Appliquer la langue lors du chargement de la page
    updateText(currentLanguage);

    // Changer de langue au clic
    switchButton.addEventListener("click", () => {
        currentLanguage = currentLanguage === "fr" ? "ar" : "fr";
        localStorage.setItem("language", currentLanguage); // Sauvegarder la langue
        updateText(currentLanguage);
    });
});
