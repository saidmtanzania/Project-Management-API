require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const Logger = require('./utils/logger');
const { createDatabaseIfNotExists } = require('../database/dbInit');


async function startServer() {
    await createDatabaseIfNotExists();
    const app = express();
    process.on("uncaughtException", function(err){
        Logger.error(`[Server] Uncaught Exception: ${err.message}`);
        process.exit(1);
    });
    
    process.on("unhandledRejection", function(reason, promise){
        const message = (reason instanceof Error) ? reason.message : reason;
        Logger.error(`[Server] Unhandled rejection at ${promise}, reason: ${message}`);
        process.exit(1);
    });

    app.use(helmet());
    app.use(express.json());
    app.use(morgan("dev"));

    const port = Number(process.env.PORT || 3000);
    app.listen(port, () => Logger.info(`Server is running on port ${port}`));
}

startServer().catch((err) => {
    Logger.error('Failed to start server:', err);
    process.exit(1);
});