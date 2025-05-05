"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Edit3,
  Trash2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getTask, deleteTask, updateTaskStatus } from "@/lib/tasks";
import type { Task } from "@/types";
import EditTaskModal from "@/components/edit-task-modal";

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/sign-in");
          return;
        }

        setUser(currentUser);
        const taskData = await getTask(currentUser.id, taskId);
        setTask(taskData);
      } catch (error) {
        console.error("Error fetching task:", error);
        setError(
          "Failed to load task. It may have been deleted or you don't have permission to view it."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId, router]);

  const handleDeleteTask = async () => {
    if (!user || !task) return;

    try {
      await deleteTask(user.id, task.id);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task. Please try again.");
    }
  };

  const handleUpdateStatus = async (
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    if (!user || !task) return;

    try {
      await updateTaskStatus(user.id, task.id, newStatus);
      setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status. Please try again.");
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTask(updatedTask);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-500 bg-orange-50 border-orange-200";
      case "low":
        return "text-green-500 bg-green-50 border-green-200";
      default:
        return "text-blue-500 bg-blue-50 border-blue-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-blue-500 bg-blue-50 border-blue-200";
      case "in-progress":
        return "text-purple-500 bg-purple-50 border-purple-200";
      case "completed":
        return "text-green-500 bg-green-50 border-green-200";
      default:
        return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "in-progress":
        return <ArrowUpRight className="w-5 h-5" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
        <div className="max-w-4xl mx-auto mt-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error || "Task not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto mt-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-blue-100">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-blue-900">{task.title}</h1>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeleteTask}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getStatusColor(
                  task.status
                )}`}
              >
                {getStatusIcon(task.status)}
                <span className="capitalize">
                  {task.status.replace("-", " ")}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full border ${getPriorityColor(
                  task.priority
                )}`}
              >
                <AlertCircle className="w-5 h-5" />
                <span className="capitalize">{task.priority} Priority</span>
              </div>

              {task.dueDate && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                  <Calendar className="w-5 h-5" />
                  <span>Due: {formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Description
            </h2>
            <p className="text-blue-700 whitespace-pre-line mb-8">
              {task.description || "No description provided."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
              <div>
                <span className="block text-blue-400">Created</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
              <div>
                <span className="block text-blue-400">Last Updated</span>
                <span>{formatDate(task.updatedAt)}</span>
              </div>
            </div>

            <div className="mt-8 border-t border-blue-100 pt-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                Update Status
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStatus("pending")}
                  disabled={task.status === "pending"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    task.status === "pending"
                      ? "bg-blue-100 border-blue-300 text-blue-600"
                      : "border-blue-200 hover:bg-blue-50 text-blue-600"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  Pending
                </button>

                <button
                  onClick={() => handleUpdateStatus("in-progress")}
                  disabled={task.status === "in-progress"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    task.status === "in-progress"
                      ? "bg-purple-100 border-purple-300 text-purple-600"
                      : "border-purple-200 hover:bg-purple-50 text-purple-600"
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  In Progress
                </button>

                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={task.status === "completed"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    task.status === "completed"
                      ? "bg-green-100 border-green-300 text-green-600"
                      : "border-green-200 hover:bg-green-50 text-green-600"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Completed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onUpdateTask={handleUpdateTask}
      />
    </div>
  );
}
