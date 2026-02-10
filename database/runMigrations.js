const fs = require("fs");
const path = require("path");
const Logger = require("../src/utils/logger");
const { db } = require("../src/utils/dbPool");

async function runMigrations() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    const migrationsDir = path.join(__dirname, "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        const already = await db.query(
            "SELECT 1 FROM migrations WHERE name = $1",
            [file]
        );
        
        if (already.rowCount === 0) {
            Logger.info(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
            const cleaned = sql.replace(/--.*$/gm, "").replace(/\s+/g, "");

            if (!cleaned) {
                Logger.warn(`Skipping empty migration: ${file}`);
                continue;
            }
            
            try{
                await db.query("BEGIN");
                await db.query(sql);
                await db.query("INSERT INTO migrations(name) VALUES($1)", [file]);
                await db.query("COMMIT");
            }catch(err){
                await db.query("ROLLBACK");
                Logger.error(`Error in migration ${file}:`, err);
                throw err;
            }
            Logger.info(`Successfully migrated: ${file}`);
        }
    }
}

module.exports = { runMigrations };
