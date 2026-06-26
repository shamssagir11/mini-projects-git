function clock() {
            let now = new Date();

            let hours = String(now.getHours()).padStart(2, '0');
            let minutes = String(now.getMinutes()).padStart(2, '0');
            let seconds = String(now.getSeconds()).padStart(2, '0');

            document.getElementById("clock").innerHTML =
                hours + ":" + minutes + ":" + seconds;
        }

        setInterval(clock, 1000);
        clock();