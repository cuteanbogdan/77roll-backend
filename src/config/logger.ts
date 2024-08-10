import winston from "winston";

const format = winston.format.combine(
  winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
  winston.format.align(),
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.prettyPrint(),
  winston.format.simple(),
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
  )
);

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console({ format })],
});

export default logger;
