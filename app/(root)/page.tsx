"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, CheckCircle2, Clock, ArrowUpRight, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getCurrentUser } from "@/lib/actions/auth.action"
import { getTasks, deleteTask, updateTaskStatus } from "@/lib/tasks"
import CreateTaskModal from "@/components/create-task-model"
import TaskCard from "@/components/task-card"
import type { Task } from "@/types"

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/sign-in")
          return
        }

        setUser(currentUser)
        const userTasks = await getTasks(currentUser.id)
        setTasks(userTasks)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserAndTasks()
  }, [router])

  const handleCreateTask = (newTask: Task) => {
    setTasks((prevTasks) => [newTask, ...prevTasks])
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return

    try {
      await deleteTask(user.id, taskId)
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    if (!user) return

    try {
      await updateTaskStatus(user.id, taskId, newStatus)
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl font-bold text-blue-900">Task Dashboard</h1>
            <p className="text-blue-600">Welcome back, {user?.name}</p>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5" />
            <span>New Task</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Tasks Column */}
          <div className="bg-white rounded-xl shadow-xl p-4 border-t-4 border-blue-400">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-blue-900">Pending</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                {getTasksByStatus("pending").length}
              </span>
            </div>

            <AnimatePresence>
              {getTasksByStatus("pending").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdateStatus={handleUpdateStatus}
                  accentColor="blue-400"
                />
              ))}
            </AnimatePresence>

            {getTasksByStatus("pending").length === 0 && (
              <div className="text-center py-8 text-blue-300">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No pending tasks</p>
              </div>
            )}
          </div>

          {/* In Progress Tasks Column */}
          <div className="bg-white rounded-xl shadow-xl p-4 border-t-4 border-blue-600">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-blue-900">In Progress</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                {getTasksByStatus("in-progress").length}
              </span>
            </div>

            <AnimatePresence>
              {getTasksByStatus("in-progress").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdateStatus={handleUpdateStatus}
                  accentColor="blue-600"
                />
              ))}
            </AnimatePresence>

            {getTasksByStatus("in-progress").length === 0 && (
              <div className="text-center py-8 text-blue-300">
                <ArrowUpRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tasks in progress</p>
              </div>
            )}
          </div>

          {/* Completed Tasks Column */}
          <div className="bg-white rounded-xl shadow-xl p-4 border-t-4 border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-800" />
              <h2 className="text-xl font-semibold text-blue-900">Completed</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                {getTasksByStatus("completed").length}
              </span>
            </div>

            <AnimatePresence>
              {getTasksByStatus("completed").map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdateStatus={handleUpdateStatus}
                  accentColor="blue-800"
                />
              ))}
            </AnimatePresence>

            {getTasksByStatus("completed").length === 0 && (
              <div className="text-center py-8 text-blue-300">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No completed tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        userId={user?.id || ""}
      />
    </div>
  )
}
