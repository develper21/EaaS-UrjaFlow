// Custom Logger with Professional Styling
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

interface LogConfig {
  timestamp: boolean;
  level: boolean;
  prefix?: string;
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

const symbols = {
  info: 'ℹ',
  success: '✓',
  warn: '⚠',
  error: '✗',
  debug: '⚡',
  arrow: '→',
  dot: '•',
  star: '★',
};

class Logger {
  private config: LogConfig;
  private minLevel: LogLevel;

  constructor(config: LogConfig = { timestamp: true, level: true }, minLevel: LogLevel = LogLevel.INFO) {
    this.config = config;
    this.minLevel = minLevel;
  }

  private formatMessage(level: LogLevel, message: string, color: string, symbol: string): string {
    const parts: string[] = [];

    // Timestamp
    if (this.config.timestamp) {
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      parts.push(`${colors.gray}${timestamp}${colors.reset}`);
    }

    // Level indicator
    if (this.config.level) {
      const levelText = LogLevel[level].padEnd(7);
      parts.push(`${color}${colors.bright}${levelText}${colors.reset}`);
    }

    // Symbol
    parts.push(`${color}${colors.bright}${symbol}${colors.reset}`);

    // Prefix
    if (this.config.prefix) {
      parts.push(`${colors.cyan}${this.config.prefix}${colors.reset}`);
    }

    // Message
    parts.push(`${color}${message}${colors.reset}`);

    return parts.join(' ');
  }

  debug(message: string, ...args: any[]) {
    if (LogLevel.DEBUG >= this.minLevel) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, colors.gray, symbols.debug), ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (LogLevel.INFO >= this.minLevel) {
      console.log(this.formatMessage(LogLevel.INFO, message, colors.blue, symbols.info), ...args);
    }
  }

  success(message: string, ...args: any[]) {
    if (LogLevel.SUCCESS >= this.minLevel) {
      console.log(this.formatMessage(LogLevel.SUCCESS, message, colors.green, symbols.success), ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (LogLevel.WARN >= this.minLevel) {
      console.warn(this.formatMessage(LogLevel.WARN, message, colors.yellow, symbols.warn), ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (LogLevel.ERROR >= this.minLevel) {
      console.error(this.formatMessage(LogLevel.ERROR, message, colors.red, symbols.error), ...args);
    }
  }

  // Specialized methods
  database(message: string, ...args: any[]) {
    console.log(this.formatMessage(LogLevel.INFO, message, colors.magenta, '🗄'), ...args);
  }

  api(message: string, ...args: any[]) {
    console.log(this.formatMessage(LogLevel.INFO, message, colors.cyan, '🌐'), ...args);
  }

  auth(message: string, ...args: any[]) {
    console.log(this.formatMessage(LogLevel.INFO, message, colors.yellow, '🔐'), ...args);
  }

  server(message: string, ...args: any[]) {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, colors.green, '🚀'), ...args);
  }

  // Section headers
  section(title: string) {
    const line = '='.repeat(60);
    console.log(`\n${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}${title.padStart(35)}${colors.reset}`);
    console.log(`${colors.cyan}${line}${colors.reset}\n`);
  }

  // Subsection
  subsection(title: string) {
    console.log(`\n${colors.yellow}${colors.bright}▶ ${title}${colors.reset}\n`);
  }

  // Success block
  successBlock(title: string, items: string[]) {
    console.log(`\n${colors.green}${colors.bright}✓ ${title}${colors.reset}`);
    items.forEach(item => {
      console.log(`${colors.green}  ${symbols.dot} ${item}${colors.reset}`);
    });
    console.log('');
  }

  // Error block
  errorBlock(title: string, error: Error | string) {
    console.log(`\n${colors.red}${colors.bright}✗ ${title}${colors.reset}`);
    if (typeof error === 'string') {
      console.log(`${colors.red}  ${symbols.dot} ${error}${colors.reset}`);
    } else {
      console.log(`${colors.red}  ${symbols.dot} ${error.message}${colors.reset}`);
      if (error.stack) {
        console.log(`${colors.gray}  ${symbols.arrow} Stack trace available${colors.reset}`);
      }
    }
    console.log('');
  }

  // Table-like display
  table(headers: string[], rows: string[][]) {
    const columnWidths = headers.map((header, i) => 
      Math.max(header.length, ...rows.map(row => (row[i] || '').length))
    );

    // Header
    const headerRow = headers.map((header, i) => 
      `${colors.bright}${colors.cyan}${header.padEnd(columnWidths[i])}${colors.reset}`
    ).join(' | ');
    console.log(headerRow);

    // Separator
    const separator = columnWidths.map(width => '-'.repeat(width)).join('-+-');
    console.log(`${colors.gray}${separator}${colors.reset}`);

    // Rows
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => 
        `${colors.white}${(cell || '').padEnd(columnWidths[i])}${colors.reset}`
      ).join(' | ');
      console.log(rowStr);
    });
    console.log('');
  }

  // Progress indicator
  progress(current: number, total: number, label: string = '') {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r${colors.blue}${bar}${colors.reset} ${percentage}% ${label}`);
    
    if (current === total) {
      console.log(''); // New line when complete
    }
  }
}

// Create different logger instances
export const logger = new Logger({ timestamp: true, level: true }, LogLevel.INFO);
export const debugLogger = new Logger({ timestamp: true, level: true }, LogLevel.DEBUG);
export const apiLogger = new Logger({ prefix: '[API]', timestamp: true, level: true }, LogLevel.INFO);
export const dbLogger = new Logger({ prefix: '[DB]', timestamp: true, level: true }, LogLevel.INFO);

export default logger;
