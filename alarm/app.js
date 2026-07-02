// ============================
// ELEMENTS
// ============================

const clock = document.getElementById("clock");
const date = document.getElementById("date");

const alarmInput = document.getElementById("alarmTime");
const alarmFile = document.getElementById("alarmFile");

const setBtn = document.getElementById("setBtn");
const stopBtn = document.getElementById("stopBtn");
const cancelBtn = document.getElementById("cancelBtn");

const countdown = document.getElementById("countdown");
const alarmStatus = document.getElementById("alarmStatus");
const warning = document.getElementById("warning");

const alarmSound = document.getElementById("alarmSound");

// ============================

let alarmTime = "";
let warningShown = false;
let alarmStarted = false;

// ============================
// USER SONG SELECT
// ============================

alarmFile.addEventListener("change", function () {

    let file = this.files[0];

    if (file) {

        alarmSound.src = URL.createObjectURL(file);

    }

});

// ============================
// LIVE CLOCK
// ============================

setInterval(() => {

    let now = new Date();

    // Time

    let h = String(now.getHours()).padStart(2, "0");
    let m = String(now.getMinutes()).padStart(2, "0");
    let s = String(now.getSeconds()).padStart(2, "0");

    clock.innerHTML = `${h} : ${m} : ${s}`;

    // Date

    let options = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    date.innerHTML = now.toLocaleDateString("en-IN", options);

    if (alarmTime != "") {

        checkAlarm(now);

    }

}, 1000);

// ============================
// SET ALARM
// ============================

setBtn.addEventListener("click", () => {

    if (alarmInput.value == "") {

        alert("Select Alarm Time");

        return;

    }

    if (alarmSound.src == "") {

        alert("Choose Alarm Song");

        return;

    }

    alarmTime = alarmInput.value;

    warningShown = false;
    alarmStarted = false;

    alarmStatus.innerHTML =
        "✅ Alarm Set : " + alarmTime;

    warning.innerHTML = "";

});

// ============================
// CHECK ALARM
// ============================

function checkAlarm(now) {

    let currentHour = now.getHours();
    let currentMinute = now.getMinutes();

    let alarmHour = Number(alarmTime.split(":")[0]);
    let alarmMinute = Number(alarmTime.split(":")[1]);

    let currentTotal = currentHour * 60 + currentMinute;

    let alarmTotal = alarmHour * 60 + alarmMinute;

    // Countdown

    let diff = alarmTotal - currentTotal;

    if (diff >= 0) {

        let hour = Math.floor(diff / 60);

        let minute = diff % 60;

        countdown.innerHTML =
            `${String(hour).padStart(2, "0")} :
             ${String(minute).padStart(2, "0")} :
             ${String(60 - now.getSeconds()).padStart(2, "0")}`;

    }

    // 2 Minute Warning

    if (diff == 2 && !warningShown) {

        warning.innerHTML =
            "⚠ Alarm will ring in 2 minutes.";

        alert("⚠ Alarm will ring in 2 minutes.");

        warningShown = true;

    }

    // Alarm Time

    if (
        currentHour == alarmHour &&
        currentMinute == alarmMinute &&
        !alarmStarted
    ) {

        alarmStarted = true;

        warning.innerHTML =
            "🔔 ALARM IS RINGING";

        alarmStatus.innerHTML =
            "🔴 Wake Up!!";

        document.body.style.background =
            "linear-gradient(135deg,#ff416c,#ff4b2b)";

        alarmSound.loop = true;

        alarmSound.play();

    }

}

// ============================
// STOP ALARM
// ============================

stopBtn.addEventListener("click", () => {

    alarmSound.pause();

    alarmSound.currentTime = 0;

    document.body.style.background =
        "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)";

    warning.innerHTML =
        "🛑 Alarm Stopped";

});

// ============================
// CANCEL ALARM
// ============================

cancelBtn.addEventListener("click", () => {

    alarmTime = "";

    countdown.innerHTML =
        "00 : 00 : 00";

    alarmStatus.innerHTML =
        "❌ No Alarm Set";

    warning.innerHTML = "";

    alarmSound.pause();

    alarmSound.currentTime = 0;

    document.body.style.background =
        "linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)";

    alert("Alarm Cancelled");

});