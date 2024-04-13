import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Home } from './Home.jsx';
import { Play } from './Play.jsx';
import { Leaderboard } from './Leaderboard.jsx';
import { Signin } from './Signin.jsx';


async function initialize() {
        if (sessionStorage.getItem('username')) {
                document.getElementById('usernameSlot').innerText = sessionStorage.getItem('username');
                document.getElementById('signinButton').innerText = "Sign Out";
		if (document.getElementById('signinMenuButton')) {document.getElementById('signinMenuButton').innerText = "Sign Out";}
        } else {
                try {
                        const res = await fetch('/auth/whoami');
                        if (res.status == 200) {
                                const result = await res.text();
                                if (result != "No token given" && result != "Invalid token") {
                                        document.getElementById('usernameSlot').innerText = JSON.parse(result).username;
                                        document.getElementById('signinButton').innerText = "Sign Out";
                                        if (document.getElementById('signinMenuButton')) {document.getElementById('signinMenuButton').innerText = "Sign Out";}
                                        sessionStorage.setItem('username', JSON.parse(result).username);
                                }
                        }
                } catch (err) {
                        console.log(err);
                }
        }
}

function signinButtonClick() {
	sessionStorage.removeItem('username');
	fetch('/auth/signout', {method: 'POST'});
	document.getElementById('usernameSlot').innerText = "";
	document.getElementById('signinButton').innerText = "Sign In";
}

function Header({ page }) {
	return (
	<header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
      <div className="col-md-4 mb-2 mb-md-0">
        <NavLink to="/home" className="d-inline-flex align-items-center link-body-emphasis text-decoration-none">
          <img src="chess.png" style={{height: '70px'}} className="img-fluid" />
          <span className="fs-4 align-items-center">The Maxwell Simulation</span>
        </NavLink>
      </div>
      
      <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
        <li><NavLink to="/home" className={`nav-link px-2 ${page === 'home' ? 'link-secondary' : ''}`}>Home</NavLink></li>
        <li><NavLink to="/play" className={`nav-link px-2 ${page === 'play' ? 'link-secondary' : ''}`}>Play</NavLink></li>
        <li><NavLink to="/leaderboard" className={`nav-link px-2 ${page === 'leaderboard' ? 'link-secondary' : ''}`}>Leaderboard</NavLink></li>
      </ul>
      
      <div className="col-md-3 text-end px-2">
        <span className="align-items-center m-3" id="usernameSlot"></span>
	<NavLink to="/signin">
        <button onClick={signinButtonClick} id="signinButton" type="button" className="btn btn-outline-primary me-2">Login</button>
        </NavLink>
	</div>
    </header>
	);
}

function Footer() {
	return (
<footer className="d-flex flex-wrap justify-content-between align-items-center py-3 mt-4 border-top">
    <div className="mx-4 col-md-4 d-flex align-items-center">
      <span className="mb-3 mb-md-0 text-body-secondary">Max Prisbrey - Last touched in 2024</span>
    </div>

    <ul className="nav mx-4 px-2 col-md-4 justify-content-end list-unstyled d-flex">
      <li className="ms-3"><a className="text-body-secondary" href="https://github.com/MaxThePrisberry/startupProject" target="_BLANK">Github</a></li>
    </ul>
  </footer>	
);
}

function App() {
	useEffect(() => {
		initialize();
	}, []);
	return (
		<BrowserRouter>
		<Routes>
			<Route path='/home' element={<><Header page='home' /><Home /></>} />
			<Route path='/play' element={<><Header page='play' /><Play /></>} />
			<Route path='/leaderboard' element={<><Header page='leaderboard' /><Leaderboard /></>} />
			<Route path='/signin' element={<><Header page='signin' /><Signin /></>} />
			<Route path='*' element={<><Header page='home' /><Home /></>} />
		</Routes>
		<Footer />
		</BrowserRouter>
	);
}

export default App
