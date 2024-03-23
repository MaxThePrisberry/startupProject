// server.js
console.log("Starting boot...");

const dbinfo = require('./dbConfig.json');
const { MongoClient } = require('mongodb');
const client = new MongoClient(`mongodb+srv://${dbinfo.username}:${dbinfo.password}@${dbinfo.hostname}/?retryWrites=true&w=majority&appName=Cluster0`);
const db = client.db(dbinfo.database);

async function testConnection() {
	await client.connect();
	console.log("Connected to msimul MongoDB database");
}

try {
	testConnection();
} catch(ex) {
	console.log(`Unable to connect to database because ${ex}`);
}

const express = require('express');
const app = express();

const port = 4000;

const { spawn } = require('child_process');
const stockfishProcess = spawn('/home/ubuntu/services/startup/stockfish-ubuntu-x86-64');

// Listen for the 'spawn' event to check if the child process was successfully spawned
stockfishProcess.on('spawn', () => {
    console.log('Stockfish process spawned successfully');
});

// Error handling for the child process
stockfishProcess.on('error', (err) => {
    console.error('Failed to spawn Stockfish process:', err);
});

stockfishProcess.on('exit', (code, signal) => {
    console.log(`Child process exited with code ${code} and signal ${signal}`);
});

console.log("Added event handlers");

let output = "";
let ready = false;

function waitForOutput(process, expectedOutput) {
    return new Promise((resolve, reject) => {
	    console.log("Inside promise");
        process.stdout.on('data', (data) => {
            output = data.toString();
            console.log("Output: " + output);

            if (output.includes(expectedOutput)) {
                console.log(expectedOutput + " is received");
                resolve();
            }
        });
    });
}

stockfishProcess.stdin.write('uci\n');

waitForOutput(stockfishProcess, 'uciok')
    .then(() => {
        console.log("UCI IS CONFIRMED OK");
        stockfishProcess.stdin.write('setoption name UCI_LimitStrength value true\n');
        stockfishProcess.stdin.write('setoption name UCI_Elo value 1500\n');
        stockfishProcess.stdin.write('ucinewgame\n');
        stockfishProcess.stdin.write('isready\n');
        return waitForOutput(stockfishProcess, 'readyok');
    })
    .then(() => {
        ready = true;
        console.log("Stockfish is ready");
    })
    .catch((err) => {
        console.error("Error:", err);
    });


// Serving static files (HTML, CSS, JS)
app.use(express.static('startup/public'));

app.get('/api/fish', (req, res) => {
    console.log(ready);
    if (!req.query.fen) {
	    res.status(400).send("No move given.");
    } else if (ready) {
        const fen = req.query.fen;
        stockfishProcess.stdin.write('ucinewgame\n');
        stockfishProcess.stdin.write('position fen ' + fen + '\n');
        stockfishProcess.stdin.write('go depth 20\n');
        
	// Wait for output until ready
        waitForOutput(stockfishProcess, 'bestmove')
            .then(() => {
		    console.log("Found best move.");
                // Assuming you want the last line of the output
                const ans = output.trim().split('\n').pop().split(' ')[1];
		    output = "";
		    stockfishProcess.stdin.write('eval\n');
		    waitForOutput(stockfishProcess, 'Final evaluation')
		    	.then(() => {
		    		const eval = output.trim().split('\n').pop().split(' ')[8];
                		stockfishProcess.stdin.write('isready\n');
				output = "";
                		res.send({ ans, eval });
			}).catch((err) => {
				console.error("Error:", err);
				res.status(504).send("Error processing eval request");
			})
            })
            .catch((err) => {
                console.error("Error:", err);
                res.status(504).send("Error processing bestmove request");
            });
    } else {
        res.status(503).send("Engine not ready.");
    }
});


//Return homepage
app.use((_req, res) => {
	res.sendFile('index.html', { root: 'public' });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
