// @ts-nocheck

import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Task from "../../database/models/Task";
import User from "../../database/models/User";
import multer from "multer";
import fs from "fs";
import { pushLogInFile } from "../../utils/logsSystem";

export async function editUser(req: Request, res: Response) {
  const { userName, avatar, email, role } = req.body as {
    userName: string;
    avatar: string;
    email: string;
    role: string;
  };
  const { id } = req.params as { id: string };

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(200)
        .json({ message: "Invalid id mongoose", isError: true });
    }
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(200).json({ message: "User not found", isError: true });
    }
    const checkUser_email = await User.findOne({ email });
    if (checkUser_email && checkUser_email.id !== id) {
      return res
        .status(200)
        .json({ message: "Email already exists", isError: true });
    }
    const checkUser_userName = await User.findOne({ userName });
    if (checkUser_userName && checkUser_userName.id !== id) {
      return res
        .status(200)
        .json({ message: "User name already exists", isError: true });
    }

    if (userName) {
      checkUser.userName = userName;
    }
    if (avatar) {
      checkUser.avatar = avatar;
    }
    if (email) {
      checkUser.email = email;
    }

    if (role) {
      checkUser.role = role;
    }
    await checkUser.save();

    return res
      .status(200)
      .json({ message: "User updated", user: checkUser, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "Users found", users, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    if (
      req.params.id === undefined ||
      req.params.id === null ||
      req.params.id === "" ||
      req.params.id === "undefined"
    ) {
      return res
        .status(200)
        .json({ message: "User id is not valid", isError: true });
    }
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(200).json({ message: "User not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "User found", user, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = req.body.users;
    const usersObject = [];
    for (let i = 0; i < users.length; i++) {
      const user = await User.findOne({ _id: new ObjectId(users[i]) });
      usersObject.push(user);
    }

    if (!usersObject.length) {
      return res
        .status(200)
        .json({ message: "Users not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "Users found", users: usersObject, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAssignedImagesUsers(req: Request, res: Response) {
  try {
    const usersId = req.body.users.split(",");
    const usersObject = [];

    for (let i = 0; i < usersId.length; i++) {
      // check object id
      if (!mongoose.Types.ObjectId.isValid(usersId[i])) {
        return res
          .status(200)
          .json({ message: "Invalid id mongoose", isError: true });
      }
      const user = await User.findOne({ _id: usersId[i] });

      if (!user) {
        return res
          .status(200)
          .json({ message: "User not found", isError: true });
      }

      usersObject.push({
        userName: user.userName,
        avatar: user.avatar,
      });
    }

    if (!usersObject) {
      return res
        .status(200)
        .json({ message: "Users not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "Users found", users: usersObject, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(200).json({ message: "User not found", isError: true });
    }
    return res
      .status(200)
      .json({ message: "User deleted", user, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTaskByUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tasks = await Task.find({ author: new ObjectId(id) });
    if (!tasks) {
      return res
        .status(200)
        .json({ message: "Tasks not found", isError: true });
    }
    for (let i = 0; i < tasks.length; i++) {
      await Task.findByIdAndDelete(tasks[i]._id);
    }
    return res
      .status(200)
      .json({ message: "Tasks deleted", tasks, isError: false });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({ message: "User not found", isError: true });
    }

    fs.readdirSync("./src/public/images/avatars").forEach((file) => {
      if (file.split(".")[0] === id)
        fs.unlinkSync(`./src/public/images/avatars/${file}`);
    });

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "./src/public/images/avatars");
      },
      filename: function (req, file, cb) {
        cb(null, id + `.${file.mimetype.split("/")[1]}`);
      },
    });

    const upload = multer({ storage }).single("file");

    upload(req, res, async function (err) {
      if (err) {
        console.log(err);
        return res
          .status(200)
          .json({ message: "Error uploading file", isError: true });
      }
      user.avatar = `${process.env.MAIN_URL}/images/avatars/${id}.${
        req.file.mimetype.split("/")[1]
      }`;
      await user.save();
      return res.status(200).json({ message: "File uploaded", user });
    });
  } catch (error) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
