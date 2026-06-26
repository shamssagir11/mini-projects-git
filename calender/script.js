const today = new Date();

const currentDay = today.getDate();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];

document.getElementById("clender").innerText =
months[currentMonth] + " " + currentYear;

const firstDay = new Date(currentYear, currentMonth, 1).getDay();
const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

const tbody = document.getElementById("box2");

let row = document.createElement("tr");

// Empty boxes before 1st day
for(let i = 0; i < firstDay; i++){
    row.appendChild(document.createElement("td"));
}

// Dates
for(let day = 1; day <= totalDays; day++){

    let cell = document.createElement("td");
    cell.innerText = day;

    // Highlight Today's Date
    if(
        day === currentDay &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
    ){
        cell.classList.add("today");
    }

    row.appendChild(cell);

    if((firstDay + day) % 7 === 0){
        tbody.appendChild(row);
        row = document.createElement("tr");
    }
}

if(row.children.length > 0){
    tbody.appendChild(row);
}