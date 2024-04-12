const dbinfo = require('./dbConfig.json');
const { MongoClient } = require('mongodb');
const client = new MongoClient(`mongodb+srv://${dbinfo.username}:${dbinfo.password}@${dbinfo.hostname}/?retryWrites=true&w=majority&appName=Cluster0`);

async function testConnection() {
        await client.connect();
        console.log("Connected to msimul MongoDB database");
}

try {
        testConnection();
} catch(err) {
        console.log(`Unable to connect to database because ${err}`);
	process.exit();
}

const db = client.db(dbinfo.database);
const logins = db.collection(dbinfo.loginCollection);
const leaderboard = db.collection(dbinfo.leaderboardCollection);
const uuid = require('uuid');
const bc = require('bcrypt');

//User login and authentication functions
async function getUser(username) {
	return await logins.findOne({ userID : username });
}

async function createUser(username, password) {
	const passwordHash = await bc.hash(password, 2);
	const user = {
		userID: username,
		passHash: passwordHash,
		token: uuid.v4()
	};
	logins.insertOne(user);
	return user;
}

async function validateHash(username, password) {
	const user = await getUser(username);
	return await bc.compare(password, user.passHash);
}

async function userExists(givenToken) {
	if (await logins.findOne({ token : givenToken })) {
		return true;
	}
	return false;
}

async function createCookie(res, generatedToken) {
	res.cookie('token', generatedToken, {
		secure: true,
		httpOnly: true,
		sameSite: 'strict'
	});
}

async function getUserName(givenToken) {
	return logins.findOne({ token : givenToken });
}



//Leaderboard record keeping functions
function addGame(gdate, gname, gtime) {
	console.log(gdate, gname, gtime);
	leaderboard.insertOne({
		date: gdate,
		name: gname,
		time: gtime
	});
}

async function getTopGames() {
	const result = await leaderboard.find().sort({ time: 1 }).limit(10).toArray();
	return result;
}

module.exports = {
	getUser,
	createUser,
	createCookie,
	validateHash,
	userExists,
	getUserName,
	addGame,
	getTopGames
}
