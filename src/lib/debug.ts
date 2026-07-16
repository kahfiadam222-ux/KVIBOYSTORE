type LogLevel = "debug" | "info" | "warn" | "error" | "security";

interface LogMessage {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  source: "server" | "client";
}

const IS_SERVER = typeof window === "undefined";
const IS_DEV = process.env.NODE_ENV === "development";

function formatLog(log: LogMessage) {
  if (IS_DEV) {
    const color = {
      debug: "\x1b[36m[DEBUG]\x1b[0m",
      info: "\x1b[32m[INFO]\x1b[0m",
      warn: "\x1b[33m[WARN]\x1b[0m",
      error: "\x1b[31m[ERROR]\x1b[0m",
      security: "\x1b[41m\x1b[37m[SECURITY]\x1b[0m",
    }[log.level];

    const sourceTag = log.source === "server" ? "🖥️  [SERVER]" : "📱 [CLIENT]";
    const contextStr = log.context ? ` \x1b[90m${JSON.stringify(log.context)}\x1b[0m` : "";
    return `${color} ${sourceTag} ${log.message}${contextStr}`;
  }
  return JSON.stringify(log);
}

function writeLog(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const log: LogMessage = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    source: IS_SERVER ? "server" : "client",
  };

  const formatted = formatLog(log);

  switch (level) {
    case "debug":
      if (IS_DEV) console.debug(formatted);
      break;
    case "info":
      console.log(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
    case "security":
      console.error(formatted);
      break;
  }
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => writeLog("debug", msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => writeLog("info", msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => writeLog("warn", msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => writeLog("error", msg, ctx),
  security: (msg: string, ctx?: Record<string, unknown>) => writeLog("security", msg, ctx),
};
