import { Router } from "express";
import {editUser, getAllUsers, getUser} from "../controllers/user/user-controller";
import authToken from "../middlewares/authToken";

const router = Router();

router.put('/editUser/:id', authToken, editUser);
router.get('/getUser/:id', authToken, getUser);
router.get('/getAllUsers', authToken, getAllUsers);

export default router;