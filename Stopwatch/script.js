let display = document.getElementById("display");

let startBtn = document.getElementById("start");
let pauseBtn = document.getElementById("pause");
let resetBtn = document.getElementById("reset");

let milliseconds = 0;
let seconds = 0;
let minutes = 0;
let hours = 0;

let timer = null;

function stopwatch(){

    milliseconds += 10;

    if(milliseconds == 1000){

        milliseconds = 0;
        seconds++;

    }

    if(seconds == 60){

        seconds = 0;
        minutes++;

    }

    if(minutes == 60){

        minutes = 0;
        hours++;

    }

    let h = String(hours).padStart(2,'0');
    let m = String(minutes).padStart(2,'0');
    let s = String(seconds).padStart(2,'0');
    let ms = String(milliseconds).padStart(3,'0');

    display.innerHTML = `${h} : ${m} : ${s} : ${ms}`;

}

startBtn.onclick = function(){

    if(timer !== null) return;

    timer = setInterval(stopwatch,10);

}

pauseBtn.onclick = function(){

    clearInterval(timer);

    timer = null;

}

resetBtn.onclick = function(){

    clearInterval(timer);

    timer = null;

    milliseconds = 0;
    seconds = 0;
    minutes = 0;
    hours = 0;

    display.innerHTML = "00 : 00 : 00 : 000";

}