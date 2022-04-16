import express, { json, urlencoded } from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth-routes";
import userRoutes from "./routes/user-routes";
import tasksRoutes from "./routes/tasks-routes";
import { connectToDB } from "./database/connection";
import session from "express-session";
import checkDashboardOptionsDB from "./utils/checkDashboardOptionsDB";
const app = express();

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

//Settings TS
declare module "express-session" {
  export interface SessionData {
    user: { [key: string]: any };
    loggedIn: boolean;
  }
}

//Settings APP
app.set("port", process.env.PORT || 3000);

//Middlewares
app.use(
  session({
    secret: "53k3153ass",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(urlencoded({ extended: true }));
app.use(cors({
  origin: ["https://ticket106frontend.netlify.app", "http://localhost:3000"],
  credentials: true,
}));
app.use(json());
app.use(morgan("tiny"));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", tasksRoutes);

//Connect to DB
connectToDB();

//Checking dashboard options in DB
checkDashboardOptionsDB();

//Listening
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
