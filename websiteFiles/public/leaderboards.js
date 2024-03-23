let loggedin = false;

async function initialize() {
        if (sessionStorage.getItem('username')) {
                document.getElementById('usernameSlot').innerText = sessionStorage.getItem('username');
                document.getElementById('signinButton').innerText = "Sign Out";
                loggedin = true;
        } else {
                try {
                        const res = await fetch('/auth/whoami');
                        if (res.status == 200) {
                                const result = await res.text();
                                if (result != "No token given") {
                                        document.getElementById('usernameSlot').innerText = JSON.parse(result).username;
                                        document.getElementById('signinButton').innerText = "Sign Out";
                                        sessionStorage.setItem('username', JSON.parse(result).username);
                                        loggedin = true;
                                }
                        }
                } catch (err) {
                        console.log(err);
                }
        }
	fillTable();
}

function signinButtonClick() {
        if (loggedin) {
                sessionStorage.removeItem('username');
                fetch('/auth/signout', {method: 'POST'});
        }
        window.location.href = '/signin.html';
}

function timeToSeconds(timeStr) {
    const regex = /(\d+)\s*d\s*(\d+)\s*h\s*(\d+)\s*m\s*(\d+)\s*s/;
    const matches = timeStr.match(regex);
    if (matches) {
        const days = parseInt(matches[1]) || 0;
        const hours = parseInt(matches[2]) || 0;
        const minutes = parseInt(matches[3]) || 0;
        const seconds = parseInt(matches[4]) || 0;
        return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
    }
    return 0; // Default to 0 if parsing fails
}

async function fillTable() {
	//simulate table data
	//tableData = [["Today", "Your Mom", "0d 2h 3m 15s"], ["Yesterday", "John Johnson", "4d 2h 42m 0s"], ["The day before yesterday", "Tanner Swendsen", "0d 0h 0m 2s"]];

	tableData = await fetch('/topgames');
	tableData = await tableData.json();

	tableData = tableData.sort((a,b) => (timeToSeconds(a.time) - timeToSeconds(b.time)));

	const table = document.getElementById('leadertable');

	tableData.forEach((value) => {
		table.innerHTML += "<tr><td>" + value.date + "</td><td>" + value.name + "</td><td>" + value.time + "</td></tr>";
	});
}
