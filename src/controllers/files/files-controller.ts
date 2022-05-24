import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import { pushLogInFile } from "../../utils/logsSystem";
import archiver from "archiver";
import User from "../../database/models/User";
import File from "../../database/models/File";

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
      let size = 0;
      let files = 0;
      let dateCreated = fs.statSync(`./src/public/files/${folder}`).birthtime;
      fs.readdirSync(`./src/public/files/${folder}`).forEach((file: any) => {
        files++;
        size += fs.statSync(`./src/public/files/${folder}/${file}`).size;
      });
      return {
        folder,
        files,
        size,
        dateCreated,
      };
    });
    folders.sort((a: any, b: any) => {
      return b.dateCreated - a.dateCreated;
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
    fs.readdirSync(`./src/public/files/${folderName}`).forEach(async (file) => {
      const fileData = fs.statSync(`./src/public/files/${folderName}/${file}`);
      await files.push({
        fileName: file.split(".")[0],
        fileType: file.split(".")[1],
        fileSize:
          fileData.size / 1000 > 1000
            ? `${(fileData.size / 1000000).toFixed(2)} MB`
            : `${(fileData.size / 1000).toFixed(2)} KB`,
        fileDate: fileData.birthtime,
        filePath: `/files/${folderName}/${file}`,
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

export async function uploadFileInFolder(req: Request, res: Response) {
  try {
    const folderName = req.params.folderName as string;
    const userId = req.params.userId as string;

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

    //Save file in folder
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `./src/public/files/${folderName}`);
      },
      filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
      },
    });
    const upload = multer({ storage }).array("files");
    upload(req, res, async (err: any) => {
      if (err) {
        return res.status(200).json({
          message: "Error uploading file",
          isError: true,
        });
      }

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return res.status(200).json({
          message: "User doesn't exist",
          isError: true,
        });
      }

      user.filesPushed = user.filesPushed + req.files.length;
      await user.save();

      //Save file into database
      const fileKeys = Object.keys(req.files);
      fileKeys.forEach(async (fileKey: any) => {
        const file = req.files[fileKey];
        console.log(file);
        const isFileExist = await File.findOne({
          path: `/files/${folderName}/${file.originalname}`,
        });
        if (!isFileExist) {
          const filePush = new File({
            name: file.originalname,
            path: `/files/${folderName}/${file.originalname}`,
          });
          filePush.save();
        }
      });

      return res.status(200).json({
        message: "Files uploaded",
        isError: false,
      });
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function deleteFiles(req: Request, res: Response) {
  try {
    const folderName = req.body.folderName as string;
    const filesNames = req.body.filesNames as string;

    if (!folderName) {
      return res.status(200).json({
        message: "Folder name is required",
        isError: true,
      });
    }

    if (!filesNames) {
      return res.status(200).json({
        message: "File name is required",
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
    const filesDeleteCorrectly = [] as any;
    const filesDeleteError = [] as any;

    filesNames.split("/").forEach(async (file) => {
      if (!fs.existsSync(`./src/public/files/${folderName}/${file}`)) {
        filesDeleteError.push(file);
      } else {
        const F = await File.findOne({
          path: `/files/${folderName}/${file}`,
        });
        if (F) {
          F.delete();
          F.save();
        }

        fs.unlinkSync(`./src/public/files/${folderName}/${file}`);
        filesDeleteCorrectly.push(file);
      }
    });

    if (filesDeleteError.length === filesNames.split("/").length) {
      return res.status(200).json({
        message: "All files doesn't exist or error in deleting",
        isError: true,
      });
    }

    return res.status(200).json({
      message: "Files deleted",
      filesDeleteCorrectly,
      filesDeleteError,
      isError: false,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function downloadFiles(req: Request, res: Response) {
  try {
    const folderName = req.body.folderName as string;
    const filesNames = req.body.filesNames as string;

    if (!folderName) {
      return res.status(200).json({
        message: "Folder name is required",
        isError: true,
      });
    }

    if (!filesNames) {
      return res.status(200).json({
        message: "File name is required",
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
    const filesDownloadCorrectly = [] as any;
    const filesDownloadError = [] as any;

    filesNames.split("/").forEach((file) => {
      if (!fs.existsSync(`./src/public/files/${folderName}/${file}`)) {
        filesDownloadError.push(file);
      } else {
        filesDownloadCorrectly.push(file);
      }
    });

    if (filesDownloadError.length === filesNames.split("/").length) {
      return res.status(200).json({
        message: "All files doesn't exist or error in downloading",
        isError: true,
      });
    }

    if (filesDownloadCorrectly.length === 1) {
      res.download(
        `./src/public/files/${folderName}/${filesDownloadCorrectly[0]}`,
        filesDownloadCorrectly[0],
        (err: any) => {
          if (err) {
            return res.status(200).json({
              message: "Error downloading file",
              isError: true,
            });
          }
        }
      );
    } else {
      const zip = archiver("zip");
      res.attachment(`${folderName}.zip`);
      zip.pipe(res);
      filesDownloadCorrectly.forEach((file) => {
        zip.append(
          fs.createReadStream(`./src/public/files/${folderName}/${file}`),
          { name: file }
        );
      });
      zip.finalize();
    }
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function deleteFolder(req: Request, res: Response) {
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
    fs.rmdirSync(`./src/public/files/${folderName}`, { recursive: true });
    return res.status(200).json({
      message: "Folder deleted",
      isError: false,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function changeFileName(req: Request, res: Response) {
  try {
    const folderName = req.body.folderName as string;
    const oldFileName = req.body.oldFileName as string;
    const newFileName = req.body.newFileName as string;
    const fileType = req.body.fileType as string;

    if (!folderName) {
      return res.status(200).json({
        message: "Folder name is required",
        isError: true,
      });
    }

    if (!oldFileName) {
      return res.status(200).json({
        message: "Old file name is required",
        isError: true,
      });
    }

    if (!newFileName) {
      return res.status(200).json({
        message: "New file name is required",
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
    if (
      !fs.existsSync(
        `./src/public/files/${folderName}/${oldFileName}.${fileType}`
      )
    ) {
      return res.status(200).json({
        message: "File doesn't exist",
        isError: true,
      });
    }

    fs.renameSync(
      `./src/public/files/${folderName}/${oldFileName}.${fileType}`,
      `./src/public/files/${folderName}/${newFileName}.${fileType}`
    );

    return res.status(200).json({
      message: "File name changed",
      isError: false,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export function getFiles(req: Request, res: Response) {
  try {
    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }
    const folders = fs.readdirSync("./src/public/files");
    const files = [] as any;
    folders.forEach((folder) => {
      const filesInFolder = fs.readdirSync(`./src/public/files/${folder}`);
      filesInFolder.forEach((file) => {
        const fileData = fs.statSync(`./src/public/files/${folder}/${file}`);
        files.push({
          folderName: folder,
          fileName: file,
          fileSize: fileData.size,
          fileModified: fileData.mtime,
        });
      });
    });

    return res.status(200).json({
      message: "Files",
      isError: false,
      files,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
