import {model, Schema} from 'mongoose';

const UserSchema = new Schema({
      userName: {
            type: String,
            required: true,
            unique: true
      },
      email: {
            type: String,
            required: true,
            unique: true
      },
      password: {
            type: String,
            required: true,
      },
      avatar: {
            type: String,
            required: false,
      },
      createdAt: {
            type: Date,
            default: Date.now
      },
      updatedAt: {
            type: Date,
            default: Date.now
      },
      role: {
            type: String,
            enum: ['General Staff', 'Admin'],
            default: 'General Staff'
      },
});

export default model('User', UserSchema);