const date = new Date();
export const logWithTime = (message: string) => console.log(`%c${date.toLocaleTimeString('de-DE')}:`, 'color: green', message);