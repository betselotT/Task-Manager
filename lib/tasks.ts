import { db } from "@/firebase/client"
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore"
import type { Task } from "@/types"

// Create a new task
export const createTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
  try {
    const taskRef = collection(db, "users", taskData.userId, "tasks")

    const newTask = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await addDoc(taskRef, newTask)

    return {
      id: docRef.id,
      ...newTask,
    } as Task
  } catch (error) {
    console.error("Error creating task:", error)
    throw error
  }
}

// Get all tasks for a user
export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const tasksRef = collection(db, "users", userId, "tasks")
    const querySnapshot = await getDocs(tasksRef)

    const tasks: Task[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()

      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
      const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate ? new Date(data.dueDate) : undefined

      tasks.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        dueDate,
      } as Task)
    })

    // Sort tasks by createdAt (newest first)
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Error getting tasks:", error)
    throw error
  }
}

// Get a single task by ID
export const getTask = async (userId: string, taskId: string): Promise<Task> => {
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId)
    const docSnap = await getDoc(taskRef)

    if (!docSnap.exists()) {
      throw new Error("Task not found")
    }

    const data = docSnap.data()

    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
    const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
    const dueDate = data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate ? new Date(data.dueDate) : undefined

    return {
      id: docSnap.id,
      ...data,
      createdAt,
      updatedAt,
      dueDate,
    } as Task
  } catch (error) {
    console.error("Error getting task:", error)
    throw error
  }
}

// Update a task
export const updateTask = async (task: Task): Promise<Task> => {
  try {
    const taskRef = doc(db, "users", task.userId, "tasks", task.id)

    const updatedTask = {
      ...task,
      updatedAt: new Date(),
    }

    await updateDoc(taskRef, updatedTask)

    return updatedTask
  } catch (error) {
    console.error("Error updating task:", error)
    throw error
  }
}

// Update task status
export const updateTaskStatus = async (
  userId: string,
  taskId: string,
  status: "pending" | "in-progress" | "completed",
): Promise<void> => {
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId)

    await updateDoc(taskRef, {
      status,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating task status:", error)
    throw error
  }
}

// Delete a task
export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, "users", userId, "tasks", taskId)
    await deleteDoc(taskRef)
  } catch (error) {
    console.error("Error deleting task:", error)
    throw error
  }
}
