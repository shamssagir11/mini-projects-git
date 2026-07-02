
const password = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");

const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");

const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");

const strengthFill = document.getElementById("strengthFill");
const strengthText = document.getElementById("strengthText");

const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowerChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()_+-={}[]<>?/";

lengthSlider.addEventListener("input", () => {
    lengthValue.innerText = lengthSlider.value;
    generatePassword();
});

generateBtn.addEventListener("click", generatePassword);

copyBtn.addEventListener("click", () => {

    if (password.value === "") return;

    navigator.clipboard.writeText(password.value);

    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';

    setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    }, 1500);

});

function generatePassword() {

    let chars = "";

    if (uppercase.checked)
        chars += upperChars;

    if (lowercase.checked)
        chars += lowerChars;

    if (numbers.checked)
        chars += numberChars;

    if (symbols.checked)
        chars += symbolChars;

    if (chars.length === 0) {

        alert("Please select at least one option.");

        return;

    }

    let pass = "";

    for (let i = 0; i < lengthSlider.value; i++) {

        const randomIndex = Math.floor(Math.random() * chars.length);

        pass += chars[randomIndex];

    }

    password.value = pass;

    checkStrength(pass);

}

function checkStrength(pass) {

    let score = 0;

    if (pass.length >= 8)
        score++;

    if (pass.length >= 12)
        score++;

    if (/[A-Z]/.test(pass))
        score++;

    if (/[a-z]/.test(pass))
        score++;

    if (/[0-9]/.test(pass))
        score++;

    if (/[^A-Za-z0-9]/.test(pass))
        score++;

    if (score <= 2) {

        strengthFill.style.width = "30%";
        strengthFill.style.background = "#ff3b30";
        strengthText.innerText = "Weak";

    }

    else if (score <= 4) {

        strengthFill.style.width = "65%";
        strengthFill.style.background = "#ff9500";
        strengthText.innerText = "Medium";

    }

    else {

        strengthFill.style.width = "100%";
        strengthFill.style.background = "#34c759";
        strengthText.innerText = "Strong";

    }

}

generatePassword();