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

function login() {
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
	if (!(userInput.value && passInput.value)) {console.log("SDF"); return;}

	//Validate with database here
	console.log(userInput.value, passInput.value);	
	test();

	/**if (document.getElementById('flexCheckDefault').checked) {
		//remembered behaviour
		localStorage.clear();

		localStorage.setItem('username', userInput.value);
		localStorage.setItem('password', passInput.value);

		location.href = "play.html";
	} else {
		//not remembered
		//no cache
		sessionStorage.clear();

                sessionStorage.setItem('username', userInput.value);
                sessionStorage.setItem('password', passInput.value);

                location.href = "play.html";
	}**/
}

async function test() {
	console.log(await fetch('/auth/create', {
                method: 'POST',
		headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username : "HELLODHFSLK",password : "THISISAPASSWORD"})
        }));
}
