import fs from "fs";
import path from "path";

export function pushLogInFile(log: string) {
  try {
    const date = new Date();
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();
    if (!fs.existsSync(path.join(__dirname, `../logs`))) {
      fs.mkdirSync(path.join(__dirname, `../logs`));
    }
    const logFile = path.join(__dirname, `../logs/${dateString}-log.txt`);
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, `${dateString} ${timeString} - ${log}`);
    } else {
      fs.appendFileSync(logFile, `\n${dateString} ${timeString} - ${log}`);
    }
  } catch (error) {
    console.log(error);
  }
}
