// server.js
console.log("Starting boot...");

const express = require('express');
const app = express();
const port = 5000;

const { spawn } = require('child_process');
const stockfishProcess = spawn('/home/ubuntu/services/apiproject/stockfish-ubuntu-x86-64');

let output = "";
let ready = false;



function waitForOutput(process, expectedOutput) {
    return new Promise((resolve, reject) => {
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
app.use(express.static('apiproject/public'));

app.get('/api/fish', (req, res) => {
    console.log(ready);
    if (ready) {
        const fen = req.query.fen;
        stockfishProcess.stdin.write('ucinewgame\n');
        stockfishProcess.stdin.write('position fen ' + fen + '\n');
        stockfishProcess.stdin.write('go depth 20\n');

        // Wait for output until ready
        waitForOutput(stockfishProcess, 'bestmove')
            .then(() => {
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
