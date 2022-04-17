import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../database/models/User";

export default async function authToken (req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization.replace("Bearer ", "");
  try {
    const decoded = verify(token, process.env.JWT_SECRET_KEY as string) as any;
    const user = await User.findById(decoded.id);
    if(!user) {
      return res.status(400).json({ message: "User not found" });
    }
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}