import { model, Schema } from "mongoose";

const FileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model("File", FileSchema);