import { Router } from "express";
import authToken from "../middlewares/authToken";
import {
  updateFile,
  createFolder,
  deleteFiles,
  deleteFolder,
  downloadFiles,
  getFile,
  getFiles,
  getFilesAverageType,
  getFilesInFolder,
  getFolders,
  uploadFileInFolder,
} from "../controllers/files/files-controller";

const router = Router();

router.get("/getFilesAverageType", authToken, getFilesAverageType);
router.get("/getFolders", authToken, getFolders);
router.get("/getFilesInFolder/:folderName", authToken, getFilesInFolder);
router.get("/getFiles", authToken, getFiles);
router.get("/getFile/:_id", authToken, getFile);
router.post("/createFolder", authToken, createFolder);
router.post(
  "/uploadFileInFolder/:userId/:folderName",
  authToken,
  uploadFileInFolder
);
router.post("/deleteFiles", authToken, deleteFiles);
router.post("/downloadFiles", authToken, downloadFiles);
router.post("/updateFile", authToken, updateFile);

router.delete("/deleteFolders/:folderName", authToken, deleteFolder);
export default router;
