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

    const file = fs.createWriteStream(
      path.join(__dirname, `../logs/logs-${dateString}.txt`),
      { flags: "a" }
    );
    file.write(`${timeString} - ${log}\n`);
    file.end();
    
  } catch (error) {
    console.log(error);
  }
}
