let game = new Chess();
console.log(game.moves());

let $speechBox = $('#txtBubble');
let statusCircle = document.getElementById('spinner');

let startTime = new Date();
let gameStarted = false;

let username = null;

let loggedin = false;

const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
const socket = new WebSocket(`${protocol}://${window.location.host}/ws`);

socket.onmessage = (event) => {
  console.log('received: ', event.data);
};

socket.onopen = () => {
	socket.send(JSON.stringify({ user: "wegettinstarted", time: "potato"}));
}



function showNotification(message) {

}

async function initialize() {
        if (sessionStorage.getItem('username')) {
                document.getElementById('usernameSlot').innerText = sessionStorage.getItem('username');
                document.getElementById('signinButton').innerText = "Sign Out";
                loggedin = true;
		acquireUsername();
        } else {
                try {
                        const res = await fetch('/auth/whoami');
                        if (res.status == 200) {
                                const result = await res.text();
                                if (result != "No token given") {
					username = JSON.parse(result).username;
                                        document.getElementById('usernameSlot').innerText = username;
                                        document.getElementById('signinButton').innerText = "Sign Out";
                                        sessionStorage.setItem('username', username);
                                        loggedin = true;
                                }
                        }
                } catch (err) {
                        console.log(err);
                }
        }
}

async function acquireUsername() {
	try {
		const res = await fetch('/auth/whoami');
		if (res.status == 200) {
			const result = await res.text();
			if (result != "No token given") {
				username = JSON.parse(result).username;
				document.getElementById('usernameSlot').innerText = username;
				document.getElementById('signinButton').innerText = "Sign Out";
				sessionStorage.setItem('username', username);
				loggedin = true;
			} else {
				document.getElementById('usernameSlot').innerText = "";
                		document.getElementById('signinButton').innerText = "Sign In";
                		loggedin = false;
			}
		}
	} catch (err) {
		console.log(err);
	}
}

function signinButtonClick() {
        if (loggedin) {
                sessionStorage.removeItem('username');
                fetch('/auth/signout', {method: 'POST'});
        }
        window.location.href = '/signin.html';
}

function onDragStart(source, piece, curPos, orientation) {
	console.log(source, piece, curPos, orientation);
	console.log(piece.search(/^b/));
	if (!gameStarted) {gameStarted = true; startTime = new Date(); setInterval(updateTimer, 1000);}
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
			
		}
	} else if (game.in_draw()) {
		
	} else if (game.in_stalemate()) {

	} else if (game.in_threefold_repetition()) {

	} else if (game.insufficient_material()) {

	}
	return gameover;
}

async function win() {
	const currentTime = new Date();
	const uname = (await (await fetch('/auth/whoami')).json()).username;
	const result = await fetch('/addgame', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			date: `${currentTime.getMonth() + 1}/${currentTime.getDate()}/${currentTime.getFullYear()}`,
			name: uname,
			time: formatMilliseconds(currentTime - startTime)
		})});
	console.log("Game added to database.");
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

function notificationSimulation() {
	const notifBox = document.getElementById('notifBox');

	notifBox.innerHTML = '<div class="d-flex flex-row justify-content-start m-2"><div class="p-3 ms-3" style="border-radius: 15px; background-color: rgba(0, 0, 0,.2);"><p class="small mb-0">Testing text to have overflow.</p></div></div>' + notifBox.innerHTML;

}

setInterval(notificationSimulation, 2000);

let config = {
	position: 'start',
	draggable: true,
	showNotation: false,
	showErrors: 'alert',
	onDragStart: onDragStart,
	onDrop: onDrop,
	onSnapEnd: onSnapEnd
}
let board = Chessboard('board1', config);
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
