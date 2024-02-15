let game = new Chess();
console.log(game.moves());

let $speechBox = $('txtBubble');

function onDragStart(source, piece, curPos, orientation) {
	console.log(source, piece, curPos, orientation);
	console.log(piece.search(/^b/));
	if (piece.search(/^b/) != -1) {return false;}
}
function onDrop(source, target, piece, newPos, oldPos, orientation) {
		
}
//function 


let config = {
	position: 'start',
	draggable: true,
	showNotation: false,
	showErrors: 'alert',
	onDragStart: onDragStart,
	onDrop: onDrop
//	onSnapEnd: onSnapEnd
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
