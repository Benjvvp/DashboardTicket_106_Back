import { Router } from "express";
import authToken from "../middlewares/authToken";
import { createFolder, getFilesAverageType, getFolders } from "../controllers/files/files-controller";

const router = Router();

router.get('/getFilesAverageType', authToken, getFilesAverageType);
router.get('/getFolders', authToken, getFolders);
router.post('/createFolder', authToken, createFolder);

export default router;