type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  job: string;
  message: string;
  durationMs?: number;
  data?: Record<string, unknown>;
}

function log(entry: LogEntry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function createJobLogger(job: string) {
  const start = Date.now();

  return {
    info(message: string, data?: Record<string, unknown>) {
      log({ level: "info", job, message, data });
    },
    warn(message: string, data?: Record<string, unknown>) {
      log({ level: "warn", job, message, data });
    },
    error(message: string, data?: Record<string, unknown>) {
      log({ level: "error", job, message, data });
    },
    done(message: string, data?: Record<string, unknown>) {
      log({ level: "info", job, message, durationMs: Date.now() - start, data });
    }
  };
}
