import express, { json, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-routes";
import tasksRoutes from "./routes/tasks-routes";
import filesRoutes from "./routes/files-routes";
import { connectToDB } from "./database/connection";
import session from "express-session";
import checkDashboardOptionsDB from "./utils/checkDashboardOptionsDB";
import SocketController from "./controllers/chat/socket-controller";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: [
      "http://localhost:3000",
      "https://dashboard-ticket-106-front.vercel.app",
      "https://ticket106frontend.netlify.app",
      "http://162.212.153.119"
    ],
  },
});

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//Settings TS
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    loggedIn: boolean;
  }
}

//Settings APP
app.set("port", process.env.PORT || 80);

//Middlewares
app.use(
  session({
    secret: "53k3153ass",
    resave: true,
    saveUninitialized: true,
    cookie: {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dashboard-ticket-106-front.vercel.app",
      "https://ticket106frontend.netlify.app",
      "http://192.168.1.89:3000",
      "http://162.212.153.119"
    ],
    credentials: true,
  })
);
app.use(json());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "./public")));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/files", filesRoutes);
//Connect to DB
connectToDB();

//Checking dashboard options in DB
checkDashboardOptionsDB();

//Socket.io
SocketController(io);

//Listening
httpServer.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
