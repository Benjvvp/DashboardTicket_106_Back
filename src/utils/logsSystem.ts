import fs from 'fs';
import path from 'path';

export function pushLogInFile(log: string){
      const date = new Date();
      const dateString = date.toLocaleDateString();
      const timeString = date.toLocaleTimeString();
      const logFile = path.join(__dirname, `../../../logs/${dateString}-log.txt`);
      if(!fs.existsSync(logFile)){
            fs.writeFileSync(logFile, `${dateString} ${timeString} - ${log}`);
      }else{
            fs.appendFileSync(logFile, `\n${dateString} ${timeString} - ${log}`);
      }
}