import {getUnseenCountMessages} from "../controllers/chat/chat-controller";
import { Router } from "express";
import authToken from "../middlewares/authToken";

const router = Router();

router.post('/getUnseenCountMessages', authToken, getUnseenCountMessages);

export default router;