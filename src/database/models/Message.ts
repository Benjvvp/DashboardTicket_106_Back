import {model, Schema} from 'mongoose';

const MessageSchema = new Schema({
      message: {
            type: String,
            required: true
      },
      user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
      },
      createdAt: {
            type: Date,
            default: Date.now
      },
      seen: {
            type: Boolean,
            default: false
      }
});

export default model('Message', MessageSchema);