import express, { json, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-routes";
import tasksRoutes from "./routes/tasks-routes";
import chatRoutes from './routes/chat-routes';
import { connectToDB } from "./database/connection";
import session from "express-session";
import checkDashboardOptionsDB from "./utils/checkDashboardOptionsDB";
import SocketController from "./controllers/chat/socket-controller";
import { Server } from "socket.io";
import {createServer} from "http";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  serveClient: false,
  cors: {
    origin: "http://localhost:3000",
  }
})

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

//Settings TS
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    loggedIn: boolean;
  }
}

//Settings APP
app.set("port", process.env.PORT || 3001);

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
app.use(cors({
  origin: ["https://ticket106frontend.netlify.app", "http://localhost:3000", "https://904f-201-188-68-135.sa.ngrok.io", "http://localhost:80"],
  credentials: true,
}));
app.use(json());
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "./public")));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/chat", chatRoutes);
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