import getUnseenCountMessages from "../controllers/chat/chat-controller";
import { Router } from "express";
import authToken from "../middlewares/authToken";

const router = Router();

router.get('/getUnseenCountMessages/:id', authToken, getUnseenCountMessages);

export default router;