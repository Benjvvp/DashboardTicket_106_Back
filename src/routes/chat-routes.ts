import {getUnseenCountMessages, getMessagesInChat} from "../controllers/chat/chat-controller";
import { Router } from "express";
import authToken from "../middlewares/authToken";

const router = Router();

router.post('/getUnseenCountMessages', authToken, getUnseenCountMessages);
router.post('/getMessagesInChat', authToken, getMessagesInChat);

export default router;