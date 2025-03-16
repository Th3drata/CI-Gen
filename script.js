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
        if (char >= '0' && char <= '9') return char.charCodeAt(0) - 48;
        if (char >= 'A' && char <= 'Z') return char.charCodeAt(0) - 55; 
        return 0; 
    };

    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        sum += charValues(input[i]) * weights[i % 3];
    }

    return sum % 10; 
}

const birthDate = "080108";
const checksum = mrz(birthDate);

console.log(`Clé de contrôle pour "${birthDate}" : ${checksum}`);