const { Pool } = require("pg");
const config = require("./dbConfig");

const db = new Pool(config);

module.exports = { db };