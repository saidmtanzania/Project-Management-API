const fs = require("fs");
const path = require("path");
const Logger = require("../src/utils/logger");


const name = process.argv[2];

if (!name) {
    Logger.error("Please kindly provide migration name");
    Logger.info("Example: npm run make:migration create_users_table");
    process.exit(1);
}

const migrationsDir = path.join(__dirname, "./migrations");
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

const files = fs.readdirSync(migrationsDir);
const numbers = files.map(f => parseInt(f.split("_")[0])).filter(n => !isNaN(n));

const nextNumber = numbers.length ? Math.max(...numbers) + 1 : 1;
const padded = String(nextNumber).padStart(3, "0");

const fileName = `${padded}_${name}.sql`;
const filePath = path.join(migrationsDir, fileName);

const template = `-- Migration: ${name}
-- Created at: ${new Date().toISOString()}

-- Write your SQL below
`;

fs.writeFileSync(filePath, template);

Logger.info(`Migration created: ${fileName}`);