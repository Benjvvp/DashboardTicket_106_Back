import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};
