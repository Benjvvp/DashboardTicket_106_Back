import fs from "fs";
import path from "path";

export function pushLogInFile(log: string) {
  try {
    const date = new Date();
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();

    console.log(`${dateString} ${timeString} - ${log}`);
  } catch (error) {
    console.log(error);
  }
}
