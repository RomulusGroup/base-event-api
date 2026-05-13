import { format, transports } from 'winston';
import { WinstonModuleOptions } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.colorize(),
        format.printf(({ timestamp, level, message, context, ms }) => {
          return `${timestamp} [${context || 'App'}] ${level}: ${message} ${ms}`;
        }),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    }),
  ],
};
