import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { pushLogInFile } from "../../utils/logsSystem";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/public/files");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export function getFilesAverageType(req: Request, res: Response) {
  try {
    let totalFiles = 0;
    let document: number = 0,
      video: number = 0,
      audio: number = 0,
      images: number = 0,
      exe: number = 0,
      other: number = 0;
    fs.readdirSync("./src/public/files").forEach((file) => {
      fs.readdirSync(`./src/public/files/${file}`).forEach((file) => {
        totalFiles++;
        switch (file.split(".")[1]) {
          case "doc":
            document++;
          case "docx":
            document++;
          case "pdf":
            document++;
          case "txt":
            document++;
            break;
          case "mp4":
            video++;
          case "avi":
            video++;
          case "mkv":
            video++;
          case "flv":
            video++;
            break;
          case "mp3":
            audio++;
          case "wav":
            audio++;
          case "wma":
            audio++;
            break;
          case "jpg":
            images++;
          case "jpeg":
            images++;
          case "png":
            images++;
          case "gif":
            images++;
            break;
          case "exe":
            exe++;
          case "msi":
            exe++;
          case "zip":
            exe++;
            break;
          default:
            other++;
        }
      });
    });

    if (document) document = (document / totalFiles) * 100;
    if (video) video = (video / totalFiles) * 100;
    if (audio) audio = (audio / totalFiles) * 100;
    if (images) images = (images / totalFiles) * 100;
    if (exe) exe = (exe / totalFiles) * 100;
    if (other) other = (other / totalFiles) * 100;

    document = document ? parseInt(document.toFixed(0)) : 0;
    video = video ? parseInt(video.toFixed(0)) : 0;
    audio = audio ? parseInt(audio.toFixed(0)) : 0;
    images = images ? parseInt(images.toFixed(0)) : 0;
    exe = exe ? parseInt(exe.toFixed(0)) : 0;
    other = other ? parseInt(other.toFixed(0)) : 0;

    return res.status(200).json({
      message: "Files average type",
      document,
      video,
      audio,
      images,
      exe,
      other,
      isError: false,
    });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function getFolders(req: Request, res: Response) {
  try {
    let folders = [];
    fs.readdirSync("./src/public/files").forEach((file) => {
      if (file.split(".")[0] !== ".") {
        folders.push(file);
      }
    });
    //Get count of files in each folder
    folders = folders.map((folder) => {
      let files = 0;
      fs.readdirSync(`./src/public/files/${folder}`).forEach((file: any) => {
        files++;
      });
      return {
        folder,
        files,
      };
    });
    return res.status(200).json({
      message: "Folders",
      folders: folders,
      isError: false,
    });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function createFolder(req: Request, res: Response) {
  try {
    const { folderName } = req.body;
    if (!folderName) {
      return res.status(200).json({
        message: "Folder name is required",
        isError: true,
      });
    }
    if (fs.existsSync(`./src/public/files/${folderName}`)) {
      return res.status(200).json({
        message: "Folder already exists",
        isError: true,
      });
    }
    fs.mkdirSync(`./src/public/files/${folderName}`);
    return res.status(200).json({
      message: "Folder created",
      isError: false,
    });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
