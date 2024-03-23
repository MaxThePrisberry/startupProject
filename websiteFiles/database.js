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
const leaderboards = db.collection(dbinfo.leaderboardCollection);
const uuid = require('uuid');
const bc = require('bcrypt');

//User login and authentication functions
async function getUser(username) {
	return logins.findOne({ userID : username });
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

async function createCookie(res, generatedToken) {
	res.cookie('token', generatedToken, {
		secure: true,
		httpOnly: true,
		sameSite: 'strict'
	});
}

module.exports = {
	getUser,
	createUser,
	createCookie
}
