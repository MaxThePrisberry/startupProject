let game = new Chess();
console.log(game.moves());

let $speechBox = $('txtBubble');

function onDragStart(source, piece, curPos, orientation) {
	console.log(source, piece, curPos, orientation);
	console.log(piece.search(/^b/));
	if (piece.search(/^b/) != -1) {return false;}
}
function onDrop(source, target, piece, newPos, oldPos, orientation) {
	let move = game.move({
		from: source,
		to: target,
		promotion: 'q'
	});

	if (move === null) {return 'snapback'}

	updatePage();

	setTimeout(testBlackRandomMove, 500);
}
function onSnapEnd(source, target, piece) {
	board.position(game.fen());
}


function updatePage() {
	
}

function testBlackRandomMove() {	
	if (game.turn() == 'b' && !game.isGameOver) {
		let rndIndex = Math.floor(Math.random() * game.moves().length);
		console.log(rndIndex);
		game.move(game.moves()[rndIndex]);
	}
	board.position(game.fen());
	updatePage();
}


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
		parentBox.style.setProperty('--board-height', (parentBox.clientHeight - document.getElementById('timer').clientHeight - 26) + 'px');
		board.resize();
	}
}
window.onload = function() {
	let parentBox = document.getElementById('mainContent');
	parentBox.style.setProperty('--board-height', (parentBox.clientHeight - document.getElementById('timer').clientHeight - 26) + 'px');
	board.resize();
}
