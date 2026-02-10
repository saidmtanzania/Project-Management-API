const { Client } = require("pg");
const Logger = require("../src/utils/logger");

async function createDatabaseIfNotExists(){
    const dbName = process.env.DB_NAME;
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: "postgres"
    });

    await client.connect();

    const res = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [dbName]
    );
    
    if (res.rowCount === 0) {
        Logger.info(`Creating database: ${dbName}`);
        await client.query(`CREATE DATABASE "${dbName}"`);
        Logger.info("Database created successfully");
    } else {
        Logger.info("Database already exists");
    }
    
    await client.end();
}

module.exports = { createDatabaseIfNotExists };