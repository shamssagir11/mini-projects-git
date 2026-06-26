const date = new Date();

    const month = date.getMonth();
    const year = date.getFullYear();

    const months = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    document.getElementById("clender").innerText =
        months[month] + " " + year;

    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();

    let body = document.getElementById("box2");
    let row = document.createElement("tr");

    for(let i = 0; i < first; i++){
        row.appendChild(document.createElement("td"));
    }

    for(let day = 1; day <= total; day++){

        let cell = document.createElement("td");
        cell.innerText = day;
        row.appendChild(cell);

        if((first + day) % 7 === 0){
            body.appendChild(row);
            row = document.createElement("tr");
        }
    }

    body.appendChild(row)