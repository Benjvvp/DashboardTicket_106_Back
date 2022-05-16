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

    if (
      !fs.existsSync(
        path.join(__dirname, `../logs/${dateString.replace("/", "-")}`)
      )
    ) {
      fs.mkdirSync(
        path.join(__dirname, `../logs/${dateString.replace("/", "-")}`)
      );
    } else {
      fs.appendFileSync(
        path.join(__dirname, `../logs/${dateString.replace("/", "-")}/log.txt`),
        `${timeString} - ${log}\n`
      );
    }
  } catch (error) {
    console.log(error);
  }
}
