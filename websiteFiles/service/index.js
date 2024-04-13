// server.js
console.log("Starting boot...");

const db = require('./database.js');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ noServer: true });

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

app.use(cookieParser());

app.get('/play.html', async (req, res, next) => {
	if (!req.cookies['token'] || !await db.userExists(req.cookies['token'])) {
		res.redirect('/signin.html');
	} else {
		next();
	}
});

app.get('/signin.html', async (req, res, next) => {
	if (req.cookies['token'] && await db.userExists(req.cookies['token'])) {
		res.redirect('/play.html');
	} else {
		next();
	}
});


//Serving static files (HTML, CSS, JS)
app.use(express.static('./public'));
app.use(express.json());


app.post('/auth/create', async (req, res) => {
	console.log("Registration Request");
	if (await db.getUser(req.body.username)) {
		res.status(409).send("User already exists");
	} else {
		const user = await db.createUser(req.body.username, req.body.password);
		db.createCookie(res, user.token);
		res.send({ token : user.token });
	}
});

app.post('/auth/login', async (req, res) => {
	console.log("Signin Request");
	const user = await db.getUser(req.body.username);
	if (!user) {
		res.status(400).send("No such user exists");
	} else {
		if (await db.validateHash(req.body.username, req.body.password)) {
			db.createCookie(res, user.token);
			res.send({ token : user.token });
		} else {
			res.status(401).send("Incorrect password");
		}
	}
});

app.post('/auth/signout', (req, res) => {
	res.clearCookie('token');
	res.send();
});

app.get('/auth/whoami', async (req, res) => {
	if (req.cookies['token']) {
		const result = await db.getUserName(req.cookies['token']);
		if (result) {
			res.send({ username : result.userID });
		} else {
			res.send("Invalid token");
		}
	} else {
		res.send("No token given");
	}
});

app.post('/lb/addgame', (req, res) => {
	db.addGame(req.body.date, req.body.name, req.body.time);
	res.send();
});

app.get('/lb/topgames', async (req, res) => {
	const games = await db.getTopGames();
	res.send(games);
});

app.get('/api/fish', (req, res) => {
    console.log(ready);
    if (!req.query.fen) {
	    res.status(400).send("No move given.");
    } else if (ready) {
        const fen = req.query.fen;
        stockfishProcess.stdin.write('ucinewgame\n');
        stockfishProcess.stdin.write('position fen ' + fen + '\n');
        stockfishProcess.stdin.write('go depth 14\n');
        
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
		    		const evaluation = output.trim().split('\n').pop().split(' ')[8];
                		stockfishProcess.stdin.write('isready\n');
				output = "";
                		res.send({ ans, evaluation });
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
app.use((req, res) => {
	res.sendFile('index.html', { root: 'public' });
});

// Starting the server
server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, function done(ws)  {
		wss.emit('connection', ws, request);
	});
});

let connections = [];

wss.on('connection', (ws) => {
	const connection = { id: connections.length + 1, alive: true, ws: ws };
	connections.push(connection);

	ws.on('message', (data) => {
		const strmsg = String.fromCharCode(...data);
		console.log("Received WebSocket Message: ", strmsg);
		const msg = JSON.parse(strmsg);
		if (msg.res) {
			if (msg.res === "win") {
				if (msg.user && msg.time) {
					connections.forEach((conn) => {
						if (conn.id != connection.id) {
							conn.ws.send(JSON.stringify({ stat: "success", msg: `<strong>${msg.user}</strong> just beat the Maxwell Simulation in <strong>${msg.time}</strong>! Go see the leaderboard to see where you stand.`}));
						}
					});
					return true;
				}
			} else if (msg.res === "loss") {
				if (msg.user) {
                                        connections.forEach((conn) => {
                                                if (conn.id != connection.id) {
							conn.ws.send(JSON.stringify({ stat: "failure", msg: `<strong>${msg.user}</strong> just lost to the Maxwell Simulation in <strong>${msg.time}</strong>. That's...normal.`}));                        
                                        	}
					});
                                        return true;
                                }
			} else if (msg.res === "start" && msg.user) {
				connections.forEach((conn) => {
					if (conn.id != connection.id) {
						conn.ws.send(JSON.stringify({ stat: "regular", msg: `<strong>${msg.user}</strong> just started a game with the Maxwell Simulation.`}));
					}
				});
				return true;
			}
		}
		ws.send(JSON.stringify({error:"Something went wrong. Check the JSON string sent."}));
	});

	ws.on('close', () => {
		const index = connections.indexOf(connection);
		connections.splice(index, 1);
		console.log(`WebSocket with ID ${connection.id} closed.`);
	});

	ws.on('pong', () => {
		connection.alive = true;
	});
});

setInterval(() => {
  connections.forEach((conn) => {
    // Kill any connection that didn't respond to the ping last time
    if (!conn.alive) {
      conn.ws.terminate();
    } else {
      conn.alive = false;
      conn.ws.ping();
    }
  });
}, 10000);
