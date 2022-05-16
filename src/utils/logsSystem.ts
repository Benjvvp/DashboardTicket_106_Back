import fs from 'fs';
import path from 'path';

export function pushLogInFile(log: string){
      const date = new Date();
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString();
      const logFile = path.join(__dirname, `../../../logs/${dateString}-log.txt`);
      const logString = `${dateString} ${timeString} ${log} \n`;
      fs.appendFileSync(logFile, logString);
}