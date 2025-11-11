/**
 * Simple structured logger for Cloudflare Workers
 */
export class Logger {
  constructor(private context: string) {}

  private log(level: string, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      context: this.context,
      message,
      ...meta,
    }

    // In production, you might want to send this to a logging service
    console.log(JSON.stringify(logData))
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('INFO', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('WARN', message, meta)
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>) {
    this.log('ERROR', message, {
      ...meta,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    })
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log('DEBUG', message, meta)
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context)
}
