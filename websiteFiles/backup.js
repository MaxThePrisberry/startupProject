// server.js
console.log("Starting boot...");

const express = require('express');
const app = express();
const port = 5000;

const { spawn } = require('child_process');
const stockfishProcess = spawn('/home/ubuntu/services/apiproject/stockfish-ubuntu-x86-64');
let output = "";
let ready = false;

stockfishProcess.stdout.on('data', (data) => {
	output = data.toString();
	console.log("Output: " + output);

	if(output.includes('uciok')) {console.log("UCI IS CONFIRMED OK"); stockfishProcess.stdin.write('setoption name UCI_LimitStrength value true\n'); stockfishProcess.stdin.write('setoption name UCI_Elo value 1500\n'); stockfishProcess.stdin.write('ucinewgame\n'); output = ""; stockfishProcess.stdin.write('isready\n');}
	if(output.includes('readyok')) {ready = true; output = "";}
});

stockfishProcess.stdin.write('uci\n');


// Serving static files (HTML, CSS, JS)
app.use(express.static('apiproject/public'));

app.get('/api/fish', (req, res) => {
	if (ready) {
		stockfishProcess.stdin.write('ucinewgame\n');
		ready = false;
		const fen = req.query.fen;
		stockfishProcess.stdin.write('position fen ' + fen + '\n');
		output = "";
		stockfishProcess.stdin.write('go depth 25\n');
		const ans = output.split('\n')[ans.length -1].split(' ')[2];
		stockfishProcess.stdin.write('isready\n');
		res.send({ ans });
	} else {
		res.status(503).send("Engine not ready.");
	}
});

// Defining a route for handling client communication
app.get('/api/message', (req, res) => {
    const message = 'Hello Geek. This Message is From Server';
    const fen = req.query.fen;
    stockfishProcess.stdin.write('uci\n');
    console.log(output);
	res.json({ fen, output });
});

//Return homepage
app.use((_req, res) => {
	res.sendFile('index.html', { root: 'public' });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
