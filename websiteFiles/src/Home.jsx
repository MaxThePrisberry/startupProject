import { NavLink } from 'react-router-dom';

function signinButtonClick() {
        sessionStorage.removeItem('username');
        fetch('/auth/signout', {method: 'POST'});
}

export function Home() {

	return (
		<main className="d-flex w-100 m-auto align-items-center justify-content-center">
        <div className="coloredBox p-5">
                <h1>The Maxwell Simulation</h1>
                <br />
                <div className="d-flex flex-column align-items-center justify-content-center">
                        <NavLink to='/play'><button className="btn menuBtn m-2">Play</button></NavLink>
                        <NavLink to='/leaderboard'><button className="btn menuBtn m-2">Leaderboards</button></NavLink>
                        <NavLink to='/signin'><button onClick={signinButtonClick} id="signinMenuButton" className="btn menuBtn m-2">Sign In</button></NavLink>
                </div>
        </div>
    </main>
	);
}
