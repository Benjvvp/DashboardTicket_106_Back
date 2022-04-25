import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardOptions from "../../database/models/DashboardOptions";
import User from "../../database/models/User";

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const correctPassword = bcryptjs.compareSync(password, user.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { email, id: user._id },
      process.env.JWT_SECRET_KEY as string
    );

    res.status(200).json({ message: "User logged in", user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginWithToken(req: Request, res: Response) {
  try {
    const token = req.headers.authorization.split(" ")[1] as any;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User logged in", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function registerUser(req: Request, res: Response) {
  const { email, password, passwordConfirmation, userName, AuthCode } =
    req.body as {
      email: string;
      password: string;
      passwordConfirmation: string;
      userName: string;
      AuthCode: string;
    };
  try {
    if (
      !email ||
      !password ||
      !passwordConfirmation ||
      !userName ||
      !AuthCode
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }
    //AuthCode check
    const dashboardOptions = await DashboardOptions.findOne({});
    if (dashboardOptions.AuthCode !== AuthCode) {
      return res.status(400).json({ message: "AuthCode is incorrect" });
    }

    //Check userName and email
    const user = await User.findOne({ userName });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists (username)" });
    }
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res.status(400).json({ message: "User already exists (email)" });
    }

    if (password !== passwordConfirmation) {
      return res
        .status(400)
        .json({ message: "Password and password confirmation do not match" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      userName: userName,
    });

    await newUser.save();

    const token = jwt.sign(
      { email, id: newUser._id },
      process.env.JWT_SECRET_KEY as string
    );

    res.status(200).json({ message: "User registered", user: newUser, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { email, oldPassword, newPassword } = req.body as {
    email: string;
    oldPassword: string;
    newPassword: string;
  };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (!bcryptjs.compareSync(oldPassword, user.password)) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    const correctPassword = bcryptjs.compareSync(oldPassword, user.password);
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);

    await User.updateOne({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
