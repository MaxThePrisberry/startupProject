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
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');



