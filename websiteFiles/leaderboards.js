function initialize() {
        if (localStorage.getItem('username')) {
                document.getElementById('usernameSlot').innerText = localStorage.getItem('username');
                document.getElementById('signinButton').innerText = "Sign Out";
        }
	fillTable();
}

function signinButtonClick() {
        if (localStorage.getItem('username')) {
                localStorage.clear();
        }
        window.location.href = "signin.html";
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

function fillTable() {
	//simulate table data
	tableData = [["Today", "Your Mom", "0d 2h 3m 15s"], ["Yesterday", "John Johnson", "4d 2h 42m 0s"], ["The day before yesterday", "Tanner Swendsen", "0d 0h 0m 2s"]];

	tableData = tableData.sort((a,b) => (timeToSeconds(a[2]) - timeToSeconds(b[2])));

	const table = document.getElementById('leadertable');

	tableData.forEach((value) => {
		table.innerHTML += "<tr><td>" + value[0] + "</td><td>" + value[1] + "</td><td>" + value[2] + "</td></tr>";
	});
}
