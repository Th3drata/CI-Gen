function toggleMenu() {
  const menu = document.querySelector(".menu");
  const overlay = document.querySelector(".overlay");
  menu.classList.toggle("open");
  overlay.classList.toggle("active");
}
function closeMenu() {
  document.querySelector(".menu").classList.remove("open");
  document.querySelector(".overlay").classList.remove("active");
}

function mrz(input) {
  const weights = [7, 3, 1];
  const charValues = (char) => {
    if (char >= "0" && char <= "9") return char.charCodeAt(0) - 48;
    if (char >= "A" && char <= "Z") return char.charCodeAt(0) - 55;
    return 0;
  };

  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    sum += charValues(input[i]) * weights[i % 3];
  }

  return sum % 10;
}

function calculateGlobalKey(firstLine, secondLine) {
  if (firstLine.length !== 36) {
    throw new Error(
      "La première ligne doit contenir exactement 36 caractères."
    );
  }
  if (secondLine.length < 35) {
    throw new Error("La deuxième ligne doit contenir au moins 35 caractères.");
  }

  const data = firstLine + secondLine.slice(0, 35);
  const weights = [7, 3, 1];
  let total = 0;

  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    let value;

    if (/[0-9]/.test(char)) {
      value = parseInt(char);
    } else if (/[A-Z]/.test(char)) {
      value = char.charCodeAt(0) - 55;
    } else if (char === "<") {
      value = 0;
    } else {
      throw new Error(`Caractère invalide dans la MRZ : ${char}`);
    }

    total += value * weights[i % 3];
  }

  return total % 10;
}

function formatMRZName(name) {
  return name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^A-Z]/g, "<") // Remplace les caractères non alphabétiques par <
    .padEnd(30, "<"); // Complète avec des < jusqu'à 30 caractères
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

document.addEventListener("scroll", function () {
  const scrollButton = document.querySelector(".scroll-top");
  if (window.scrollY > 300) {
    scrollButton.classList.add("visible");
  } else {
    scrollButton.classList.remove("visible");
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cniForm");
  const previewSection = document.querySelector(".preview-section");
  let cniData = {};

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  }

  function getFormattedDateForMRZ(dateString) {
    if (!dateString) return "";
    return dateString.replace(/-/g, "").slice(2);
  }

  function updatePreview(data) {
    const birthDateMRZ = getFormattedDateForMRZ(data.dateNaissance);
    const checksumBirth = mrz(birthDateMRZ);

    // Construction de la première ligne MRZ
    let firstLine = "IDFRA";
    firstLine += (
      formatMRZName(data.nom || "") + "<<<<<<<<<<<<<<<<<<<<<<<<"
    ).slice(0, 25);
    firstLine += (data.numDepartement || "").padStart(3, "0");
    firstLine += "021";
    // S'assurer que la ligne fait exactement 36 caractères
    firstLine = firstLine.slice(0, 36);

    // Construction de la deuxième ligne MRZ
    let secondLine = "";
    secondLine += (data.numeroCNI || "").padStart(12, "0"); // 12 caractères
    secondLine += (formatMRZName(data.prenom || "") + "<<<<<<").slice(0, 12); // 12 caractères
    secondLine += birthDateMRZ; // 6 caractères
    secondLine += checksumBirth; // 1 caractère
    secondLine += data.sexe || "<"; // 1 caractère
    secondLine = (secondLine + "0").slice(0, 35); // Ajout des < manquants jusqu'à 35 caractères

    let globalKey;
    try {
      globalKey = calculateGlobalKey(firstLine, secondLine);
      secondLine += globalKey; // Ajout de la clé globale comme 36ème caractère
    } catch (e) {
      console.error("Erreur lors du calcul de la clé globale:", e);
      globalKey = "0";
      secondLine += globalKey;
    }

    previewSection.innerHTML = `
      <h3>Aperçu des données</h3>
      <div class="preview-data">
        <h4>Informations personnelles</h4>
        <p>Nom : ${data.nom || ""}</p>
        <p>Prénom : ${data.prenom || ""}</p>
        <p>Sexe : ${data.sexe || ""}</p>
        <p>Taille : ${data.taille || ""} cm</p>
        <p>Date de naissance : ${formatDate(data.dateNaissance) || ""}</p>
        <p>Ville de naissance : ${data.villeNaissance || ""}</p>
        <p>Département de naissance : ${data.numDepartementNaissance || ""}</p>

        <h4>Adresse</h4>
        <p>Rue : ${data.adresse || ""}</p>
        <p>Ville : ${data.ville || ""}</p>
        <p>Code postal : ${data.codePostal || ""}</p>

        <h4>Informations administratives</h4>
        <p>Préfecture : ${data.prefecture || ""}</p>
        <p>Département : ${data.numDepartement || ""}</p>
        <p>Date de délivrance : ${formatDate(data.dateDelivrance) || ""}</p>

        <h4>Informations CNI</h4>
        <p>Numéro CNI : ${data.numeroCNI || ""}</p>
        <p>Algo Recto 1 : ${data.algoRecto1 || ""}</p>
        <p>Algo Recto 2 : ${data.algoRecto2 || ""}</p>
        <p>MRZ Date Naissance : ${birthDateMRZ}</p>
        <p>Clé de contrôle : ${checksumBirth}</p>

        <h4>Informations MRZ</h4>
        <p class="mrz-line">Ligne 1 (${
          firstLine.length
        } car.) : ${firstLine}</p>
        <p class="mrz-line">Ligne 2 (${
          secondLine.length
        } car.) : ${secondLine}</p>
        <p>Date de naissance MRZ : ${birthDateMRZ}</p>
        <p>Clé de contrôle naissance : ${checksumBirth}</p>
        <p>Clé de contrôle globale : ${globalKey}</p>
      </div>
    `;
  }

  // Mise à jour en temps réel
  form.addEventListener("input", function (e) {
    cniData[e.target.name] = e.target.value;
    updatePreview(cniData);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    cniData.nom = form.nom.value;
    cniData.prenom = form.prenom.value;
    cniData.sexe = form.sexe.value;
    cniData.taille = form.taille.value;
    cniData.dateNaissance = form.dateNaissance.value;
    cniData.villeNaissance = form.villeNaissance.value;
    cniData.numDepartementNaissance = form.numDepartementNaissance.value;

    cniData.adresse = form.adresse.value;
    cniData.ville = form.ville.value;
    cniData.codePostal = form.codePostal.value;

    cniData.prefecture = form.prefecture.value;
    cniData.numDepartement = form.numDepartement.value;
    cniData.dateDelivrance = form.dateDelivrance.value;

    cniData.photo = form.photo.files[0];
    cniData.signature = form.signature.files[0];
    cniData.tampon = form.tampon.files[0];

    cniData.numeroCNI = form.numeroCNI.value;
    cniData.algoRecto1 = form.algoRecto1.value;
    cniData.algoRecto2 = form.algoRecto2.value;

    console.log("Données du formulaire :", cniData);
    updatePreview(cniData);
  });

  // Gestion des inputs de type file
  document.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener("change", function () {
      const textInput = this.parentElement.querySelector('input[type="text"]');
      textInput.value = this.files[0] ? this.files[0].name : "";
    });
  });
});
