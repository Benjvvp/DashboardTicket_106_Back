import { Router } from "express";
import {editUser, getAllUsers, getAssignedImagesUsers, getUser} from "../controllers/user/user-controller";
import authToken from "../middlewares/authToken";

const router = Router();

router.put('/editUser/:id', authToken, editUser);
router.get('/getUser/:id', authToken, getUser);
router.get('/getAllUsers', authToken, getAllUsers);
router.post('/getAssignedImagesUsers', authToken, getAssignedImagesUsers);
export default router;