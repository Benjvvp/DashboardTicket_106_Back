import bcryptjs from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardOptions from "../../database/models/DashboardOptions";
import User from "../../database/models/User";
import { pushLogInFile } from "../../utils/logsSystem";

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: "User not found", isError: true });
    }

    const correctPassword = bcryptjs.compareSync(password, user.password);
    if (!correctPassword) {
      return res
        .status(200)
        .json({ message: "Incorrect password", isError: true });
    }

    const token = jwt.sign(
      { email, id: user._id },
      process.env.JWT_SECRET_KEY as string
    );

    res
      .status(200)
      .json({ message: "User logged in", user, token, isError: false });
  } catch (error) {
    let message = "Unkwon error";
    if (error instanceof Error) message = error.message;
    pushLogInFile(message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginWithToken(req: Request, res: Response) {
  try {
    const token = req.headers?.authorization?.split(" ")[1] as string | undefined | null;
    if (!token || token === "" || token === "undefined") {
      return res
        .status(200)
        .json({ message: "Token not found", isError: true });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as { email: string; id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(200).json({ message: "User not found", isError: true });
    }
    res.status(200).json({ message: "User logged in", user, isError: false });
  } catch (error) {
    let message = "Unkwon error";
    if (error instanceof Error) message = error.message;
    pushLogInFile(message);
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
      return res.status(200).json({ message: "Missing fields", isError: true });
    }
    //AuthCode check
    const dashboardOptions = await DashboardOptions.findOne({});
    if (dashboardOptions.AuthCode !== AuthCode) {
      return res
        .status(200)
        .json({ message: "AuthCode is incorrect", isError: true });
    }

    //Check userName and email
    const user = await User.findOne({ userName });
    if (user) {
      return res
        .status(200)
        .json({ message: "User already exists (username)", isError: true });
    }
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res
        .status(200)
        .json({ message: "User already exists (email)", isError: true });
    }

    if (password !== passwordConfirmation) {
      return res.status(200).json({
        message: "Password and password confirmation do not match",
        isError: true,
      });
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

    res.status(200).json({
      message: "User registered",
      user: newUser,
      token,
      isError: false,
    });
  } catch (error) {
    let message = "Unkwon error";
    if (error instanceof Error) message = error.message;
    pushLogInFile(message);
  }
}
