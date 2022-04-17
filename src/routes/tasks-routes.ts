import { Router } from "express";
import {
  changeTaskProgress,
  changeTaskStatus,
  createTask,
  deleteTask,
  editTask,
  getMyTasks,
  getTasks,
  getTasksAssigned,
} from "../controllers/tasks/task-controller";
import authToken from "../middlewares/authToken";

const router = Router();

router.get('/getTasks', authToken, getTasks);
router.get('/getMyTasks/:id', authToken, getMyTasks);
router.get('/getTasksAssigned/:id', authToken, getTasksAssigned);

router.post('/createTask', authToken, createTask);

router.put('/:id', authToken, editTask);
router.delete('/:id', authToken, deleteTask);

router.post('/changeTaskStatus/:id', authToken, changeTaskStatus);
router.post('/changeTaskProgress/:id', authToken, changeTaskProgress);

export default router;