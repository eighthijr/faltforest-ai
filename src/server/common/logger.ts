type LogLevel = 'info' | 'warn' | 'error';

export function logEvent(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    event,
    payload,
  };

  const text = JSON.stringify(line);
  if (level === 'error') {
    console.error(text);
    return;
  }

  console.log(text);
}
