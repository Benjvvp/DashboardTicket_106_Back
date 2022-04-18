import {model, Schema} from 'mongoose';

const TaskSchema = new Schema({
      title: {
            type: String,
            required: true,
      },
      description: {
            type: String,
            required: false,
      },
      status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
      },
      priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Low'
      },
      category: {
            type: String,
            enum: ['Software Team', 'Design Team', 'Testing Team', 'Other'],
            default: 'Other'
      },
      progress: {
            type: Number || String,
            required: true,
            default: 0
      },
      author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
      },
      assignedUsers: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
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
});

export default model('Task', TaskSchema);