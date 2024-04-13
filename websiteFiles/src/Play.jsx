import { useEffect } from 'react';

let game = new Chess();
let board;
let username;
let $speechBox;
let statusCircle;

let startTime = new Date();
let gameStarted = false;

const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

socket.onmessage = (event) => {
        const result = JSON.parse(event.data);
        notification(result.stat, result.msg);
};

socket.onopen = () => {
        notification("regular", "You're connected to the server, and will get live updates from anyone playing the Maxwell Simulation.");
}

function startupBoard() {
	console.log(game.moves());
	const config = {
	        position: 'start',
	        draggable: true,
	        showNotation: false,
	        showErrors: 'alert',
	        onDragStart: onDragStart,
	        onDrop: onDrop,
	        onSnapEnd: onSnapEnd
	}
	board = Chessboard('board1', config);
	$speechBox = $('#txtBubble');
	statusCircle = document.getElementById('spinner');
}

async function acquireUsername() {
        try {
                const res = await fetch('/auth/whoami');
                if (res.status == 200) {
                        const result = await res.text();
                        if (result != "No token given" && result != "Invalid token") {
                                username = JSON.parse(result).username;
                                sessionStorage.setItem('username', username);
                        } else {
				alert("Invalid User");
                        }
                }
        } catch (err) {
                console.log(err);
        }
}


function onDragStart(source, piece, curPos, orientation) {
        console.log(source, piece, curPos, orientation);
        console.log(piece.search(/^b/));
        if (!gameStarted) {gameStarted = true; startTime = new Date(); setInterval(updateTimer, 1000); socket.send(JSON.stringify({ res: "start", user: username }));}
        if (piece.search(/^b/) != -1) {return false;}
}
function onDrop(source, target, piece, newPos, oldPos, orientation) {
        let move = game.move({
                from: source,
                to: target,
                promotion: 'q'
        });

        if (move === null) {return 'snapback'}
        console.log(source, target);

        if (endgameCheck()) {return;}

        maxwellMove();
}
function onSnapEnd(source, target, piece) {
        board.position(game.fen());
}
function endgameCheck() {
        let gameover = game.game_over();
        if (game.in_checkmate()) {
                alert("Checkmate!");
                //Add win to database
                if (game.turn() == 'b') {

                        win();
                } else {

                        lose();
                }
        } else if (game.in_draw()) {

                lose();
        } else if (game.in_stalemate()) {
                lose();
        } else if (game.in_threefold_repetition()) {
                lose();
        } else if (game.insufficient_material()) {
                lose();
        }
        return gameover;
}

async function win() {
        const currentTime = new Date();
        const timeStr = formatMilliseconds(currentTime - startTime);
        socket.send(JSON.stringify({ res: "win", user: username, time: timeStr }));
        const result = await fetch('/addgame', {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                        date: `${currentTime.getMonth() + 1}/${currentTime.getDate()}/${currentTime.getFullYear()}`,
                        name: username,
                        time: timeStr
                })});
        console.log("Game added to database.");
}

function lose() {
        const currentTime = new Date();
        const timeStr = formatMilliseconds(currentTime - startTime);
        socket.send(JSON.stringify({ res: "loss", user: username, time: timeStr}));
}
function updateTimer() {
        let now = new Date();
        now = now - startTime;
        document.getElementById('timer').innerText = formatMilliseconds(now);
}

function formatMilliseconds(milliseconds) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        hours %= 24;
        minutes %= 60;
        seconds %= 60;
        return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
}
async function maxwellMove() {
        //Visual cues
        $speechBox.text('Hmm...');
        statusCircle.classList.remove("breathing");
        statusCircle.classList.add("spinner-border");

        //Get maxwell's move
        let response = await fetch('/api/fish?fen=' + game.fen());
        //let response = await fetch('startup.msimul.click/api/fish?fen=' + game.fen());
	
	let data = await response.json();

        //Log to console move and eval
        console.log(data);
        console.log(data.ans);

        //Update local game state
        let move = game.move(data.ans, { sloppy: true });

        //Error checking
        if (move === null) {console.log("Thinks its invalid");}

        //Update whole board in case of En Passant, etc
        board.position(game.fen());

        //End the game if necessary
        endgameCheck();

        //Remove visual cues
        statusCircle.classList.remove("spinner-border");
        statusCircle.classList.add("breathing");

        //Third party API query for dad joke :)
        response = await fetch('https://icanhazdadjoke.com/', {headers: {Accept:"application/json"}});
        data = await response.json();
        $speechBox.text(data.joke);
}
function notification(type, message) {
        const notifBox = document.getElementById('notifBox');

        let icontag = "";
        switch (type) {
                case "regular":
                        icontag = 'exclamation.svg';
                        break;
                case "success":
                        icontag = 'check.svg'
                        break;
                case "failure":
                        icontag = 'cross.svg';
                        break;
        }
        notifBox.innerHTML = `<div class="d-flex justify-content-start m-2"><div class="p-3 ms-3 col d-flex" style="border-radius: 15px; background-color: rgba(0, 0, 0,.2);"><img class="float-start m-2" style="width:30px;" src="${icontag}"/><p class="small mb-0">${message}</p></span></div></div>` + notifBox.innerHTML;

}
window.onresize = function() {
        if(Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) > 600) {
                let parentBox = document.getElementById('mainContent');
                parentBox.style.setProperty('--board-height', Math.min((parentBox.clientHeight - document.getElementById('timer').clientHeight - 26), parentBox.clientWidth) + 'px');
                board.resize();
        }
}
window.onload = function() {
        let parentBox = document.getElementById('mainContent');
        parentBox.style.setProperty('--board-height', Math.min((parentBox.clientHeight - document.getElementById('timer').clientHeight - 26), parentBox.clientWidth) + 'px');
        board.resize();
}


export function Play() {
	useEffect(() => {
		startupBoard();
	}, []);
	return (
	<main className="container min-vw-100 h-100 px-2 mx-0 overflow-hidden">
                <div className="row mh-100 h-100">
                        <div className="d-none d-xl-inline col-xl-3">
                                <div id="notifBox" className="h-100 overflow-auto text-center"></div>
                        </div>
                        <div id="mainContent" className="h-100 d-flex flex-column align-items-center justify-content-start col-sm-12 col-lg-8 col-xl-6">
                                <div id="timerSection" className="d-inline-flex">
                                        <h3 id="timer">0d 0h 0m 0s</h3>
                                        <span id="spinner" className="breathing mx-2 text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                        </span>
                                </div>
                                <div id="board1" style={{width: 'var(--board-height)'}}></div>
                        </div>
                        <div id="commentBox" className="d-none d-xl-inline float-end col-xl-3">
                                <img id="myphoto" src="me.jpeg" style={{height: '200px'}} className="float-end m-3" /><br />
                                <p id="txtBubble" className="float-end m-3">My comments are delightfully delectable.</p>
                        </div>
                </div>
    </main>
	);
}

