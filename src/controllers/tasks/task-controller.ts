import { Request, Response } from "express";
import Task from "../../database/models/Task";

export async function createTask(req: Request, res: Response){
      const {title, description, author, assignedUsers, priority, category } = req.body as { title: string; description: string; author: string; assignedUsers: string[], priority: string, category: string };
      let fieldRequired = [];
      if(!title) fieldRequired.push('title');
      if(!description) fieldRequired.push('description');
      if(!author) fieldRequired.push('author');
      if(!priority) fieldRequired.push('priority');
      if(!category) fieldRequired.push('category');

      if(!title || !description || !author || !priority || !category) {
            return res.status(400).json({
                  message: 'Missing required fields in the request body. Fields: ' + fieldRequired.join(', ')
            });
      };

      try {
            const newTask = new Task({
                  title,
                  description,
                  author,
                  priority,
                  category,
                  assignedUsers : assignedUsers ? assignedUsers : [],
            });

            await newTask.save();

            return res.status(200).json({ message: "Task created", task: newTask });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

export async function deleteTask(req: Request, res: Response){
      const { id } = req.params;
      try {
            const task = await Task.findById(id);
            if (!task) {
                  return res.status(400).json({ message: "Task not found" });
            }
            task.remove();
            return res.status(200).json({ message: "Task deleted" });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

export async function changeTaskStatus(req: Request, res: Response){
      const { id } = req.params;
      const { status } = req.body as { status: string };

      try {
            const task = await Task.findById(id);
            
            if (!task) {
                  return res.status(400).json({ message: "Task not found" });
            }

            if(!status || !['Pending', 'In Progress', 'Completed'].includes(status)){
                  return res.status(400).json({ message: "Invalid status" });
            }

            task.status = status;
            await task.save();
            return res.status(200).json({ message: "Task status changed", task });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

export async function changeTaskProgress(req: Request, res: Response){
      const { id } = req.params;
      const { progress } = req.body as { progress: number };
      
      try {
            const task = await Task.findById(id);

            if (!task) {
                  return res.status(400).json({ message: "Task not found" });
            }

            if(!progress || progress < 0 || progress > 100){
                  return res.status(400).json({ message: "Invalid progress" });
            }

            task.progress = progress;

            await task.save();
            return res.status(200).json({ message: "Task progress changed", task });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}
export async function editTask(req: Request, res: Response){
      const { id } = req.params;
      const { title, description, priority, assignedUsers } = req.body as { title: string; description: string; assignedUsers: string[], priority: string };

      try {
            const task = await Task.findById(id);
            if (!task) {
                  return res.status(400).json({ message: "Task not found" });
            }
            if (title) {
                  task.title = title;
            }
            if (description) {
                  task.description = description;
            }
            if (assignedUsers) {
                  task.assignedUsers = assignedUsers;
            }
            if (priority) {
                  task.priority = priority;
            }
            await task.save();
            return res.status(200).json({ message: "Task updated", task });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

// Get tasks
export async function getTasks(req: Request, res: Response){
      try {
            const tasks = await Task.find({});

            if(!tasks || tasks.length === 0){
                  return res.status(400).json({ message: "Tasks not found" });
            }

            return res.status(200).json({ message: "Tasks fetched", tasks });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

export async function getTasksAssigned(req: Request, res: Response){
      const { id } = req.params;

      try {
            const tasks = await Task.find({ assignedUsers: id });

            if(!tasks || tasks.length === 0){
                  return res.status(400).json({ message: "Tasks not found" });
            }

            return res.status(200).json({ message: "Tasks fetched", tasks });
      } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}

export async function getMyTasks(req: Request, res: Response){
      const {id} = req.params;

      try{
            const tasks = await Task.find({ author: id });

            if(!tasks || tasks.length === 0){
                  return res.status(400).json({ message: "Tasks not found" });
            }

            return res.status(200).json({ message: "Tasks fetched", tasks });
      }
      catch(error){
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
      }
}