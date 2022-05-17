import { Router } from "express";
import authToken from "../middlewares/authToken";
import { createFolder, getFilesAverageType, getFilesInFolder, getFolders } from "../controllers/files/files-controller";

const router = Router();

router.get('/getFilesAverageType', authToken, getFilesAverageType);
router.get('/getFolders', authToken, getFolders);
router.get('/getFilesInFolder/:folderName', authToken, getFilesInFolder);
router.post('/createFolder', authToken, createFolder);


export default router;