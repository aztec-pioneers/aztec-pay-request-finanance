/**
 * Browser stub for pino logger.
 * The Aztec SDK imports { pino, symbols } from 'pino' which doesn't work
 * in the browser. This stub provides a console-based replacement.
 */

const noop = () => {};

function createLogger() {
  const logger: any = {
    info: noop,
    warn: noop,
    error: console.error,
    debug: noop,
    trace: noop,
    fatal: console.error,
    silent: noop,
    verbose: noop,
    level: 'info',
    child: () => createLogger(),
    isLevelEnabled: () => false,
    bindings: () => ({}),
    flush: noop,
    on: noop,
    addListener: noop,
    once: noop,
    removeListener: noop,
    removeAllListeners: noop,
    emit: noop,
    write: noop,
    end: noop,
  };
  // Return a proxy so any unknown method call (e.g. verbose, silly) is a noop
  return new Proxy(logger, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return noop;
    },
  });
}

export function pino(..._args: any[]) {
  return createLogger();
}

pino.destination = () => ({ write: noop, end: noop, flush: noop, on: noop });
pino.transport = () => ({ write: noop, end: noop, flush: noop, on: noop });
pino.multistream = () => ({ write: noop, end: noop, flush: noop, on: noop });
pino.levels = { values: { fatal: 60, error: 50, warn: 40, info: 30, debug: 20, trace: 10 }, labels: { 60: 'fatal', 50: 'error', 40: 'warn', 30: 'info', 20: 'debug', 10: 'trace' } };
pino.stdSerializers = { req: (a: any) => a, res: (a: any) => a, err: (a: any) => a };
pino.stdTimeFunctions = { epochTime: () => `,"time":${Date.now()}`, unixTime: () => `,"time":${Math.round(Date.now() / 1000)}`, nullTime: () => '' };

export const symbols = {
  needsMetadataGsym: Symbol.for('pino.metadata'),
  serializersSym: Symbol.for('pino.serializers'),
  streamSym: Symbol.for('pino.stream'),
  setLevelSym: Symbol.for('pino.setLevel'),
  getLevelSym: Symbol.for('pino.getLevel'),
  levelValSym: Symbol.for('pino.levelVal'),
};

export default pino;
