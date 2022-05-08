import { Router } from "express";
import {
  addUserToTask,
  changeTaskProgress,
  changeTaskStatus,
  createTask,
  deleteTask,
  editTask,
  getMyTasks,
  getTask,
  getTasks,
  getTasksAssigned,
  removeUserToTask,
} from "../controllers/tasks/task-controller";
import authToken from "../middlewares/authToken";

const router = Router();

router.get('/getTasks', authToken, getTasks);
router.get('/getMyTasks/:id', authToken, getMyTasks);
router.get('/getTasksAssigned/:id', authToken, getTasksAssigned);
router.get('/getTask/:id', authToken, getTask);

router.post('/createTask', authToken, createTask);

router.post('/addUserToTask/:id', authToken, addUserToTask);
router.post('/removeUserToTask/:id', authToken, removeUserToTask);

router.put('/editTask/:id', authToken, editTask);
router.delete('/deleteTask/:id', authToken, deleteTask);

router.post('/changeTaskStatus/:id', authToken, changeTaskStatus);
router.post('/changeTaskProgress/:id', authToken, changeTaskProgress);


export default router;