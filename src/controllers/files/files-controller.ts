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
    let document = 0,
      video = 0,
      audio = 0,
      images = 0,
      exe = 0,
      other = 0;
    fs.readdirSync("./src/public/files").forEach((file) => {
      fs.readdirSync(`./src/public/files/${file}`).forEach((file) => {
        totalFiles++;
        switch (file.split(".")[1]) {
          case "doc":
            document++;
            break;
          case "docx":
            document++;
            break;
          case "pdf":
            document++;
            break;
          case "txt":
            document++;
            break;
          case "mp4":
            video++;
            break;
          case "avi":
            video++;
            break;
          case "mkv":
            video++;
            break;
          case "flv":
            video++;
            break;
          case "mp3":
            audio++;
            break;
          case "wav":
            audio++;
            break;
          case "wma":
            audio++;
            break;
          case "jpg":
            images++;
            break;
          case "jpeg":
            images++;
            break;
          case "png":
            images++;
            break;
          case "gif":
            images++;
            break;
          case "exe":
            exe++;
            break;
          case "msi":
            exe++;
            break;
          case "zip":
            exe++;
            break;
          default:
            other++;
            break;
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
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function getFolders(req: Request, res: Response) {
  try {
    let folders = [] as any;
    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
      return res.status(200).json({
        message: "Doesn't exist any folder",
        isError: false,
      });
    }
    fs.readdirSync("./src/public/files").forEach((file) => {
      if (file.split(".")[0] !== ".") {
        folders.push(file);
      }
    });
    //Get count of files in each folder
    folders = folders.map((folder: any) => {
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
  } catch (error: any) {
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
    if (folderName.indexOf(" ") !== -1) {
      return res.status(200).json({
        message: "Folder name can't have space",
        isError: true,
      });
    }
    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
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
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function getFilesInFolder(req: Request, res: Response) {
  try {
    const folderName = req.params.folderName as string;
    if (!folderName) {
      return res.status(200).json({
        message: "Folder name is required",
        isError: true,
      });
    }
    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }
    if (!fs.existsSync(`./src/public/files/${folderName}`)) {
      return res.status(200).json({
        message: "Folder doesn't exist",
        isError: true,
      });
    }
    const files = [] as any;
    fs.readdirSync(`./src/public/files/${folderName}`).forEach((file) => {
      const fileData = fs.statSync(`./src/public/files/${folderName}/${file}`);
      files.push({
        fileName: file.split(".")[0],
        fileType: file.split(".")[1],
        fileSize: fileData.blksize / 1000 + " KB",
        fileDate: fileData.birthtime,
        filePath: `/files/${folderName}/${file}`
      });
    });
      return res.status(200).json({
      message: "Folder files",
      files,
      isError: false,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
