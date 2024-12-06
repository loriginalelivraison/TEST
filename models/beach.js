// Stocker les titres récupérés
let titles = [];

// Charger les titres des plages depuis l'API
async function loadTitles() {
  try {
    const response = await fetch('/api/voyages');
    const voyages = await response.json();

    // Extraire les titres
    titles = voyages.map((voyage) => voyage.title);
    
  } catch (err) {
    console.error("Erreur lors du chargement des titres:", err);
  }
}

// Fonction pour filtrer les suggestions
function filterSuggestions() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");

  // Si l'input est vide, cacher les suggestions
  if (!input) {
    suggestions.innerHTML = "";
    return;
  }

  // Filtrer les titres qui correspondent à l'input
  const filteredTitles = titles.filter((title) =>
    title.toLowerCase().includes(input)
  );

  // Générer la liste des suggestions
  suggestions.innerHTML = filteredTitles.length
    ? filteredTitles
        .map((title) => `<li onclick="selectSuggestion('${title}')">${title}</li>`)
        .join("")
    : '<li class="no-results">Aucune suggestion</li>';
}

// Fonction pour remplir l'input quand une suggestion est cliquée
function selectSuggestion(title) {
  document.getElementById("searchInput").value = title;

  // Cacher la liste après sélection
  document.getElementById("suggestions").innerHTML = "";
}

// Charger les titres au chargement de la page
document.addEventListener("DOMContentLoaded", loadTitles);
