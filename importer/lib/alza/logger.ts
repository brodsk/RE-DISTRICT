/**
 * RE:DISTRICT — Alza Importer Logger
 * Structured console logger with phases and levels.
 */

type LogLevel = "info" | "warn" | "error" | "debug" | "success";

interface LogEntry {
  ts: string;
  level: LogLevel;
  phase: string;
  message: string;
  data?: Record<string, unknown>;
}

const LEVEL_PREFIX: Record<LogLevel, string> = {
  info:    "ℹ️ ",
  warn:    "⚠️ ",
  error:   "❌",
  debug:   "🔍",
  success: "✅",
};

class ImportLogger {
  private entries: LogEntry[] = [];
  private phase = "init";

  setPhase(phase: string): void {
    this.phase = phase;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      phase: this.phase,
      message,
      data,
    };
    this.entries.push(entry);

    const prefix = LEVEL_PREFIX[level];
    const phaseTag = `[${this.phase}]`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : "";

    // eslint-disable-next-line no-console
    console.log(`${entry.ts} ${prefix} ${phaseTag} ${message}${dataStr}`);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log("error", message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  success(message: string, data?: Record<string, unknown>): void {
    this.log("success", message, data);
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
    this.phase = "init";
  }
}

// Singleton logger shared across the import run
export const logger = new ImportLogger();
