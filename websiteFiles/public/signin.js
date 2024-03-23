const userInput = document.getElementById('floatingInput');
const passInput = document.getElementById('floatingPassword');

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
}

function signinButtonClick() {
        if (loggedin) {
                sessionStorage.removeItem('username');
                fetch('/auth/signout', {method: 'POST'});
        }
        window.location.href = '/signin.html';
}

async function register() {
	if (!userInput.value) {
                userInput.classList.add('is-invalid');
        } else {
                userInput.classList.remove('is-invalid');
        }
        if (!passInput.value) {
                passInput.classList.add('is-invalid');
        } else {
                passInput.classList.remove('is-invalid');
        }
        if (!(userInput.value && passInput.value)) {return;}

	try {
		const result = await fetch('/auth/create', {
                	method: 'POST',
                	headers: {'Content-Type': 'application/json'},
                	body: JSON.stringify({username : userInput.value, password : passInput.value})
        	});
		if (result.status == 200) {
			window.location.href = 'play.html';
		} else if (result.status == 409) {
			alert("Username is already taken");
		} else {
			alert("Something went wrong - check console");
			console.log(request);
		}
	} catch (err) {
		console.log(err);
	}
}

async function login() {
	if (!userInput.value) {
		userInput.classList.add('is-invalid');
	} else {
		userInput.classList.remove('is-invalid');
	}
	if (!passInput.value) {
		passInput.classList.add('is-invalid');
	} else {
		passInput.classList.remove('is-invalid');
	}
	if (!(userInput.value && passInput.value)) {return;}

	//Validate with database
	try {
		const result = await fetch('/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username : userInput.value, password : passInput.value})
                });
                if (result.status == 200) {
                        window.location.href = 'play.html';
                } else if (result.status == 400) {
                        alert("No such user exists.");
                } else if (result.status == 401) {
			alert("Incorrect password.");
		} else {
                        alert("Something went wrong - check console");
                        console.log(request);
                }
        } catch (err) {
                console.log(err);
        }
}
