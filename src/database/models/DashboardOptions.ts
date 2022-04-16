import {model, Schema} from 'mongoose';

const DashboardOptionsSchema = new Schema({
      AuthCode: {
            type: String,
            required: true,
            default: Math.random().toString(36).substring(7),
            unique: true
      },
});

export default model('Dashboard', DashboardOptionsSchema);