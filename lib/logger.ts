import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors (optional for console)
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // Default to info
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.json() // Use JSON for easy parsing in the admin dashboard
    ),
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
        }),
        // All logs
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'app.log'),
        }),
    ],
});

// If we're not in production then log to the `console`
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            ),
        })
    );
}

export default logger;
