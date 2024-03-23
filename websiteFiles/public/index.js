let loggedin = false;

async function initialize() {
        if (sessionStorage.getItem('username')) {
                document.getElementById('usernameSlot').innerText = sessionStorage.getItem('username');
                document.getElementById('signinButton').innerText = "Sign Out";
		document.getElementById('signinMenuButton').innerText = "Sign Out";
		loggedin = true;
        } else {
		try {
			const res = await fetch('/auth/whoami');
			if (res.status == 200) {
				const result = await res.text();
				if (result != "No token given") {
					document.getElementById('usernameSlot').innerText = JSON.parse(result).username;
	       				document.getElementById('signinButton').innerText = "Sign Out";
					document.getElementById('signinMenuButton').innerText = "Sign Out";
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
