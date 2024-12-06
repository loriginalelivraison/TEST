document.addEventListener("DOMContentLoaded", () => {
    const switchButton = document.getElementById("language-switch");

    // Textes dans les deux langues
    const translations = {
        fr: {
            headerTitle: "VOUS ETES CONNECTER 	",
            card1Title: "ACHETER",
            card1Desc: "acheter un produit européen depuis notre store",
            card2Title: "COMMANDE SPÉCIALE",
            card2Desc: "si vous ne trouvez pas un produit; vous le commandez et on l'achète pour vous",
            card5Title: "VENDRE MES PRODUITS",
            card5Desc: "acheter un produit commandée et le vendre via notre store",
            card4Title: "ENVOYER UN DOCUMENT",
            card4Desc: "envoyez tous types de documents importants ou urgent ",
            important: " Livraison Kaba ne fait pas la vente des produit ni des médicaments, elle fait uniquement le lien entre une personne qui veux vendre un produit et une autre personne qui veux l'acheter . Visitez notre site officiel",
        },
        ar: {
            headerTitle: "لقد قمت بتسجيل الدخوج",
            card1Title: "شراء",
            card1Desc: "اشترِ منتجًا أوروبيًا كابا من متجرنا",
            card2Title: "طلب خاص",
            card2Desc: "إذا لم تجد منتجًا ، يمكنك طلبه وسنقوم بشرائه لك",
            card5Title: "بيع منتجاتي",
            card5Desc: "لديك منتجات ؟ يمكنك بيعها هنا",
            card4Title: "إرسال وثيقة",
            card4Desc: "أرسل الوثائق الهامة أو المستعجلة (توكيل، وثيقة إدارية...)",
            important: " كابا ديليفري لا تبيع المنتجات أو الأدوية ، بل تربط فقط بين الشخص الذي يريد بيع منتج وشخص آخر يريد شرائه. قم بزيارة موقعنا الرسمي",
        }
    };

    let currentLanguage = "fr"; // Langue par défaut

    const updateText = (language) => {
        document.getElementById("header-title").textContent = translations[language].headerTitle;
        document.getElementById("card1-title").textContent = translations[language].card1Title;
        document.getElementById("card1-desc").textContent = translations[language].card1Desc;
        document.getElementById("card2-title").textContent = translations[language].card2Title;
        document.getElementById("card2-desc").textContent = translations[language].card2Desc;
        document.getElementById("card5-title").textContent = translations[language].card5Title;
        document.getElementById("card5-desc").textContent = translations[language].card5Desc;
        document.getElementById("card4-title").textContent = translations[language].card4Title;
        document.getElementById("card4-desc").textContent = translations[language].card4Desc;
        document.getElementById("important").textContent = translations[language].important;

        // Mise à jour de la direction pour l'arabe
        if (language === "ar") {
            document.body.classList.add("ar");
            switchButton.textContent = "🛎️ Français";
        } else {
            document.body.classList.remove("ar");
            switchButton.textContent = "🛎️ عربي";
        }
    };

    switchButton.addEventListener("click", () => {
        currentLanguage = currentLanguage === "fr" ? "ar" : "fr";
        updateText(currentLanguage);
    });

    // Initialisation
    updateText(currentLanguage);
});
