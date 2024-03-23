const userInput = document.getElementById('floatingInput');
const passInput = document.getElementById('floatingPassword');

function initialize() {
	if (localStorage.getItem('username')) {
		document.getElementById('usernameSlot').innerText = localStorage.getItem('username');
		document.getElementById('signinButton').innerText = "Sign Out";
	}
}

function signinButtonClick() {
	if (localStorage.getItem('username')) {
		localStorage.clear();
	}
	window.location.href = "signin.html";
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
