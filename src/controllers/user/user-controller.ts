import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Task from "../../database/models/Task";
import User from "../../database/models/User";
import multer from "multer";
import fs from "fs";

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
      return res.status(400).json({ message: "Invalid id mongoose" });
    }
    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const checkUser_email = await User.findOne({ email });
    if (checkUser_email && checkUser_email.id !== id) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const checkUser_userName = await User.findOne({ userName });
    if (checkUser_userName && checkUser_userName.id !== id) {
      return res.status(400).json({ message: "User name already exists" });
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

export async function getUser(req: Request, res: Response) {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User found", user });
  } catch (error) {
    console.log(error);
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
      return res.status(400).json({ message: "Users not found" });
    }

    return res.status(200).json({ message: "Users found", users: usersObject });
  } catch (error) {
    console.log(error);
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
        return res.status(400).json({ message: "Invalid id mongoose" });
      }
      const user = await User.findOne({ _id: usersId[i] });

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      usersObject.push({
        userName: user.userName,
        avatar: user.avatar,
      });
    }

    if (!usersObject) {
      return res.status(400).json({ message: "Users not found" });
    }

    return res.status(200).json({ message: "Users found", users: usersObject });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTaskByUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tasks = await Task.find({ author: new ObjectId(id) });
    if (!tasks) {
      return res.status(400).json({ message: "Tasks not found" });
    }
    for (let i = 0; i < tasks.length; i++) {
      await Task.findByIdAndDelete(tasks[i]._id);
    }
    return res.status(200).json({ message: "Tasks deleted", tasks });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    fs.readdirSync("./src/public/images/avatars").forEach((file) => {
      if (file.split(".")[0] === id) fs.unlinkSync(`./src/public/images/avatars/${file}`);
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
        return res.status(400).json({ message: "Error uploading file" });
      }
      user.avatar = `${process.env.MAIN_URL}/images/avatars/${id}.${
        req.file.mimetype.split("/")[1]
      }`;
      await user.save();
      return res.status(200).json({ message: "File uploaded", user });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
