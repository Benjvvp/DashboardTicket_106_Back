import { Router } from "express";
import { loginUser, loginWithToken, registerUser } from "../controllers/auth/auth-controller";
import authToken from "../middlewares/authToken";

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/loginWithToken', authToken, loginWithToken);
export default router;