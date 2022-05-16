import { Request, Response } from "express";
import Task from "../../database/models/Task";
import { pushLogInFile } from "../../utils/logsSystem";

export async function createTask(req: Request, res: Response) {
  const { title, description, author, assignedUsers, priority, category } =
    req.body as {
      title: string;
      description: string;
      author: string;
      assignedUsers: string[];
      priority: string;
      category: string;
    };
  const tasks = await Task.find({});
  const fieldRequired = [];
  if (!title) fieldRequired.push("title");
  if (!description) fieldRequired.push("description");
  if (!author) fieldRequired.push("author");
  if (!priority) fieldRequired.push("priority");
  if (!category) fieldRequired.push("category");

  if (!title || !description || !author || !priority || !category) {
    return res.status(200).json({
      message: "Missing required fields in the request body.",
      isError: true,
    });
  }

  //Check if the task already exists
  const taskExists = tasks.find((task) => task.title === title);
  if (taskExists) {
    return res.status(200).json({
      message: "Task already exists.",
      isError: true,
    });
  }

  try {
    const newTask = new Task({
      title,
      description,
      author,
      priority,
      category,
      assignedUsers: assignedUsers ? assignedUsers : [],
    });

    await newTask.save();

    return res
      .status(200)
      .json({ message: "Task created", task: newTask, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTask(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(200).json({ message: "Task not found", isError: true });
    }
    task.remove();
    return res.status(200).json({ message: "Task deleted", isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function editTask(req: Request, res: Response) {
  const { id } = req.params;
  const { title, description, category, priority, status, progress } =
    req.body as {
      title: string;
      description: string;
      category: string;
      status: string;
      priority: string;
      progress: number;
    };

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(200).json({ message: "Task not found", isError: true });
    }
    if (title) {
      task.title = title;
    }
    if (description) {
      task.description = description;
    }
    if (category) {
      task.category = category;
    }
    if (status) {
      task.status = status;
    }
    if (priority) {
      task.priority = priority;
    }
    if (progress) {
      task.progress = progress;
    }
    await task.save();
    return res
      .status(200)
      .json({ message: "Task updated", task, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function addUserToTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { user } = req.body as { user: string };
    const task = await Task.findById(id);
    if (!task) {
      return res.status(200).json({ message: "Task not found", isError: true });
    }
    if (task.assignedUsers.includes(user)) {
      return res
        .status(200)
        .json({ message: "User already assigned to task", isError: true });
    }
    task.assignedUsers.push(user);
    await task.save();
    return res
      .status(200)
      .json({ message: "User added to task", task, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function removeUserToTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body as { userId: string };

    const task = await Task.findById(id);
    if (!task) {
      return res.status(200).json({ message: "Task not found", isError: true });
    }
    task.assignedUsers = task.assignedUsers.filter((user: {userId: string}) => {
      return user.toString() !== userId;
    });
    await task.save();
    return res
      .status(200)
      .json({ message: "User removed from task", task, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
// Get tasks
export async function getTasks(req: Request, res: Response) {
  try {
    const tasks = await Task.find({});

    if (!tasks || tasks.length === 0) {
      return res
        .status(200)
        .json({ message: "Tasks not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "Tasks fetched", tasks, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function getTask(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(200).json({ message: "Task not found", isError: true });
    }
    return res
      .status(200)
      .json({ message: "Task fetched", task, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function getTasksAssigned(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const tasks = await Task.find({ assignedUsers: id });

    if (!tasks || tasks.length === 0) {
      return res
        .status(200)
        .json({ message: "Tasks not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "Tasks fetched", tasks, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMyTasks(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const tasks = await Task.find({ author: id });

    if (!tasks || tasks.length === 0) {
      return res
        .status(200)
        .json({ message: "Tasks not found", isError: true });
    }

    return res
      .status(200)
      .json({ message: "Tasks fetched", tasks, isError: false });
  } catch (error: any) {
    pushLogInFile(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
