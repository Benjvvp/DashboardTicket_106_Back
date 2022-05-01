import { Router } from "express";
import {
  deleteUser,
  editUser,
  getAllUsers,
  getAssignedImagesUsers,
  getUser,
  deleteTaskByUser,
  uploadAvatar,
  getUsers
} from "../controllers/user/user-controller";
import authToken from "../middlewares/authToken";
import multer from "multer";

const router = Router();

router.put("/editUser/:id", authToken, editUser);
router.get("/getUser/:id", authToken, getUser);
router.post("/getUsers", authToken, getUsers);
router.get("/getAllUsers", authToken, getAllUsers);
router.post("/getAssignedImagesUsers", authToken, getAssignedImagesUsers);
router.delete("/deleteUser/:id", authToken, deleteUser);
router.delete("/deleteTaskByUser/:id", authToken, deleteTaskByUser);
router.post("/uploadAvatar/:id", authToken, uploadAvatar);

export default router;
