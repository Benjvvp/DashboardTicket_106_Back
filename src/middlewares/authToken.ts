import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(403).json({ mssg: "No token Provided" });

  try {
    const decoded = verify(token, process.env.JWT_SECRET_KEY as string) as {
      email: string;
      id: string;
      iat: number;
      exp: number;
    };
    req['decoded'] = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ mssg: "Invalid Token" });
  }
};
