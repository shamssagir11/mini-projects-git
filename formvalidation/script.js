const form = document.getElementById("form");

const username = document.getElementById("username");
const number = document.getElementById("number");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");

form.addEventListener("submit", function (e) {

    e.preventDefault();

    let valid = true;

    // Username
    if (!/^[A-Za-z ]+$/.test(username.value.trim())) {

        showError(username, "Only letters are allowed");
        valid = false;

    } else {

        showSuccess(username);

    }

    // Number
    if (!/^[0-9]{10}$/.test(number.value.trim())) {

        showError(number, "Enter 10 digit mobile number");
        valid = false;

    } else {

        showSuccess(number);

    }

    // Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {

        showError(email, "Invalid Email");
        valid = false;

    } else {

        showSuccess(email);

    }

    // Password
    const pass = password.value;

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pass)) {

        showError(password, "8+ chars, Upper, Lower, Number & Special");

        valid = false;

    } else {

        showSuccess(password);

    }

    // Confirm Password

    if (confirm.value !== pass) {

        showError(confirm, "Password does not match");

        valid = false;

    } else {

        showSuccess(confirm);

    }

    if (valid) {

        alert("🎉 Registration Successful");

        form.reset();

    }

});

function showError(input, message) {

    const box = input.parentElement;

    const small = box.querySelector("small");

    small.innerText = message;

    small.style.color = "red";

    input.style.border = "2px solid red";

}

function showSuccess(input) {

    const box = input.parentElement;

    const small = box.querySelector("small");

    small.innerText = "✔ Valid";

    small.style.color = "limegreen";

    input.style.border = "2px solid limegreen";

}