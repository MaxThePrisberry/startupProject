import { useNavigate } from 'react-router-dom';

async function register() {
	const userInput = document.getElementById('floatingInput');
const passInput = document.getElementById('floatingPassword');
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
        if (!(userInput.value && passInput.value)) {return false;}

        try {
                const result = await fetch('/auth/create', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username : userInput.value, password : passInput.value})
                });
                if (result.status == 200) {
                        return true;
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
	const userInput = document.getElementById('floatingInput');
const passInput = document.getElementById('floatingPassword');
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
        if (!(userInput.value && passInput.value)) {return false;}

        //Validate with database
        try {
                const result = await fetch('/auth/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username : userInput.value, password : passInput.value})
                });
                if (result.status == 200) {
			return true;
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

export function Signin() {
	const navigate = useNavigate();
	async function handleLogin() {
		if (await login()) {
			navigate('/play');
		}
	}
	async function handleRegister() {
		if (await register()) {
			navigate('/play');
		}
	}
	return (
        	<main className="form-signin w-100 m-auto">
  <form className="coloredBox text-center p-4 m-auto" style={{width: '400px'}}>
          <div className="form-check-inline">
            <img className="mb-4" src="chess.png" alt="" width="72" height="57" />
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
          </div>
    <div className="form-floating">
      <input type="text" className="form-control" id="floatingInput" placeholder="Username" />
      <label htmlFor="floatingInput">Username</label>
    </div>
    <div className="form-floating">
      <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
      <label htmlFor="floatingPassword">Password</label>
    </div>

    <div className="form-check text-start my-3">
      <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
      <label className="form-check-label" htmlFor="flexCheckDefault">
        Remember me
      </label>
    </div>
    <button className="btn menuBtn w-100 py-2 mb-2" type="button" onClick={handleRegister}>Register</button>
    <button className="btn menuBtn w-100 py-2" type="button" onClick={handleLogin}>Sign in</button>
    <p className="mt-5 mb-3 text-body-secondary">Use with caution...</p>
  </form>
</main>
	);
}

