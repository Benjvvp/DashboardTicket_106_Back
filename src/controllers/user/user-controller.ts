import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../database/models/User";

export async function editUser(req: Request, res: Response) {
  const { userName, avatar } = req.body as { userName: string; avatar: string; };
  const { id } = req.params as { id: string };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id mongoose" });
    }
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (userName) {
      checkUser.userName = userName;
    }
    if (avatar) {
      checkUser.avatar = avatar;
    }

    await checkUser.save();

    return res.status(200).json({ message: "User updated", user: checkUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find();
    return res.status(200).json({ message: "Users found", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}