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
