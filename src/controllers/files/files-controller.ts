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

export async function getFolders(req: Request, res: Response) {
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
      if (file.split(".")[0] !== ".") folders.push(file);
    });
    //Get count of files in each folder
    folders = await folders.map((folder: any) => {
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

export async function getFilesInFolder(req: Request, res: Response) {
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
    const files = [] as Array<any>;

    const filesInDB = await File.find({
      $text: { $search: "/files/Videos", $caseSensitive: true },
    });

    new Promise((resolve, reject) => {
      fs.readdirSync(`./src/public/files/${folderName}`).forEach(
        async (file) => {
          const fileInDB = await filesInDB.find(
            (f: any) => f.path === `/files/${folderName}/${file}`
          );
          if (fileInDB) {
            const fileData = fs.statSync(
              `./src/public/files/${folderName}/${file}`
            );

            files.push({
              fileId: fileInDB._id ? fileInDB._id : "",
              fileDescription: fileInDB.description ? fileInDB.description : "",
              fileName: file.split(".")[0],
              fileType: file.split(".")[1],
              fileSize:
                fileData.size / 1000 > 1000
                  ? `${(fileData.size / 1000000).toFixed(2)} MB`
                  : `${(fileData.size / 1000).toFixed(2)} KB`,
              fileDate: fileData.birthtime,
              filePath: `/files/${folderName}/${file}`,
            });
          }
        }
      );
      resolve(files);
    })
      .then(() => {
        return res.status(200).json({
          message: "Files in folder",
          files,
          isError: false,
        });
      })
      .catch((error: any) => {
        pushLogInFile(error);
        return res.status(500).json({ message: "Internal server error" });
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
    const idFiles = req.body.idFiles as string;

    if (!idFiles) {
      return res.status(200).json({
        message: "Files id is required",
        isError: true,
      });
    }

    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }

    const filesDeleteCorrectly = [] as any;
    const filesDeleteError = [] as any;

    idFiles.split("/").forEach(async (file) => {
      const fileInDB = await File.findOne({ _id: file });
      if (fileInDB) {
        const path = fileInDB.path;
        const fileName = path.split("/")[3];
        const folderName = path.split("/")[2];
        const filePath = `./src/public/files/${folderName}/${fileName}`;

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          fileInDB.delete();
          filesDeleteCorrectly.push(fileInDB._id);
        } else {
          filesDeleteError.push(fileInDB._id);
        }
      }
    });

    if (filesDeleteError.length === idFiles.split("/").length) {
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

export async function downloadFiles(req: Request, res: Response) {
  try {
    const idFiles = req.body.idFiles as string[];
    if (!idFiles) {
      return res.status(200).json({
        message: "Files id is required",
        isError: true,
      });
    }

    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }

    const filesDownloadCorrectly = [] as any;
    const filesDownloadError = [] as any;

    const filesInDB = await File.find();

    filesInDB.forEach(async (file) => {
      const path = file.path;
      const fileName = path.split("/")[3];
      const folderName = path.split("/")[2];
      const filePath = `./src/public/files/${folderName}/${fileName}`;
      if (fs.existsSync(filePath) && idFiles.includes(file._id.toString())) {
        filesDownloadCorrectly.push(filePath);
      } else {
        filesDownloadError.push(filePath);
      }
    });
    if (filesDownloadError.length === idFiles.length) {
      return res.status(200).json({
        message: "All files doesn't exist or error in downloading",
        isError: true,
      });
    }

    const zip = archiver("zip");
    res.attachment("files.zip");
    zip.pipe(res);
    await filesDownloadCorrectly.forEach(async (filePath) => {
      zip.append(fs.createReadStream(filePath), {
        name: filePath.split("/")[5],
      });
    });
    zip.finalize();
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

export async function updateFile(req: Request, res: Response) {
  try {
    const idFile = req.body.idFile as string;
    const fileNameEditing = req.body.fileNameEditing as string;
    const fileDescriptionEditing = req.body.fileDescriptionEditing as string;

    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }

    const fileInDB = await File.findById({ _id: idFile });

    if (fileNameEditing.length > 0) {
      fs.renameSync(
        `./src/public${fileInDB.path}`,
        `./src/public${fileInDB.path.replace(
          fileInDB.name,
          `${fileNameEditing}.${fileInDB.name.split(".")[1]}`
        )}`
      );

      const newPath = fileInDB.path.replace(
        fileInDB.name,
        `${fileNameEditing}.${fileInDB.name.split(".")[1]}`
      );

      fileInDB.name = `${fileNameEditing}.${fileInDB.name.split(".")[1]}`;
      fileInDB.path = newPath;
    }

    if (fileDescriptionEditing.length > 0) {
      fileInDB.description = fileDescriptionEditing;
    }
    fileInDB.save();

    return res.status(200).json({
      message: "File updated",

      isError: false,
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFiles(req: Request, res: Response) {
  try {
    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }
    const folders = fs.readdirSync("./src/public/files");
    const files = [] as any;

    const filesInDB = await File.find();

    new Promise((resolve, reject) => {
      folders.forEach(async (folderName) => {
        fs.readdirSync(`./src/public/files/${folderName}`).forEach(
          async (file) => {
            const fileInDB = await filesInDB.find(
              (f: any) => f.path === `/files/${folderName}/${file}`
            );
            if (fileInDB) {
              const fileData = fs.statSync(
                `./src/public/files/${folderName}/${file}`
              );

              files.push({
                fileId: fileInDB._id ? fileInDB._id : "",
                fileDescription: fileInDB.description
                  ? fileInDB.description
                  : "",
                fileName: file.split(".")[0],
                fileType: file.split(".")[1],
                fileSize:
                  fileData.size / 1000 > 1000
                    ? `${(fileData.size / 1000000).toFixed(2)} MB`
                    : `${(fileData.size / 1000).toFixed(2)} KB`,
                fileDate: fileData.birthtime,
                filePath: `/files/${folderName}/${file}`,
                fileModified: fileData.mtime,
                folderName,
              });
            }
          }
        );
      });
      resolve(files);
    })
      .then((files) => {
        return res.status(200).json({
          message: "Files",
          isError: false,
          files,
        });
      })
      .catch((error: any) => {
        pushLogInFile(error);
        return res.status(500).json({ message: "Internal server error" });
      });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getFile(req: Request, res: Response) {
  try {
    const fileId = req.params._id as string;

    if (!fs.existsSync("./src/public/files")) {
      fs.mkdirSync("./src/public/files");
    }

    const fileInDB = await File.findById(fileId);

    if (!fileInDB) {
      return res.status(200).json({
        message: "File doesn't exist",
        isError: true,
      });
    }

    new Promise((resolve, reject) => {
      if (fileInDB) {
        const fileData = fs.statSync(`./src/public${fileInDB.path}`);
        if (fileInDB._id.toString() === fileId) {
          const returnFile = {
            fileId: fileInDB._id ? fileInDB._id : "",
            fileDescription: fileInDB.description ? fileInDB.description : "",
            fileName: fileInDB.path.split("/")[3].split(".")[0],
            fileType: fileInDB.path.split("/")[3].split(".")[1],
            fileSize:
              fileData.size / 1000 > 1000
                ? `${(fileData.size / 1000000).toFixed(2)} MB`
                : `${(fileData.size / 1000).toFixed(2)} KB`,
            fileDate: fileData.birthtime,
            filePath: `${fileInDB.path}`,
            fileModified: fileData.mtime,
            folderName: fileInDB.path.split("/")[2],
          };
          resolve(returnFile);
        }
      }
    }).then((file) => {
      return res.status(200).json({
        message: "File",
        isError: false,
        file,
      });
    });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
