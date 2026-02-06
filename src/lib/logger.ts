/**
 * Production-ready logging utility for JobReady.ai
 * Provides structured logging with different log levels and context
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  requestId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getConfiguredLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  return LOG_LEVELS[level] !== undefined ? level : "info";
}

function shouldLog(level: LogLevel): boolean {
  const configuredLevel = getConfiguredLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel];
}

function formatLog(entry: LogEntry): string {
  if (process.env.NODE_ENV === "production") {
    // JSON format for production (easier to parse in log aggregators)
    return JSON.stringify(entry);
  }
  // Human-readable format for development
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
  
  // Specialized logging for API requests
  apiRequest: (method: string, path: string, duration: number, status: number) => {
    log("info", `API ${method} ${path}`, { duration: `${duration}ms`, status });
  },
  
  // Log job search operations
  jobSearch: (skills: string[], resultCount: number, sources: string[]) => {
    log("info", "Job search completed", { skills, resultCount, sources });
  },
};

export default logger;
