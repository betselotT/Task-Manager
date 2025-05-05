"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Trash2,
  Edit3,
  MoreVertical,
  Calendar,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import type { Task } from "@/types";
import EditTaskModal from "./edit-task-modal";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdateStatus: (
    id: string,
    status: "pending" | "in-progress" | "completed"
  ) => void;
  accentColor: string;
}

export default function TaskCard({
  task,
  onDelete,
  onUpdateStatus,
  accentColor,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-orange-500 bg-orange-50";
      case "low":
        return "text-green-500 bg-green-50";
      default:
        return "text-blue-500 bg-blue-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "in-progress":
        return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-blue-800" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5 }}
        className={`bg-white border border-${accentColor}/20 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-300`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-blue-900 mb-1">{task.title}</h3>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full hover:bg-blue-50 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-blue-400" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-blue-100">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2 text-blue-500" />
                    Edit Task
                  </button>

                  {task.status !== "pending" && (
                    <button
                      onClick={() => {
                        onUpdateStatus(task.id, "pending");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      Mark as Pending
                    </button>
                  )}

                  {task.status !== "in-progress" && (
                    <button
                      onClick={() => {
                        onUpdateStatus(task.id, "in-progress");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2 text-blue-600" />
                      Mark as In Progress
                    </button>
                  )}

                  {task.status !== "completed" && (
                    <button
                      onClick={() => {
                        onUpdateStatus(task.id, "completed");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-blue-800" />
                      Mark as Completed
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-blue-700 mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-2">
          <div className="flex items-center text-xs">
            {getStatusIcon(task.status)}
            <span className="ml-1 text-blue-700 capitalize">
              {task.status.replace("-", " ")}
            </span>
          </div>

          <div
            className={`flex items-center text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
              task.priority
            )}`}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            <span className="capitalize">{task.priority}</span>
          </div>

          {task.dueDate && (
            <div className="flex items-center text-xs text-blue-600">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>
      </motion.div>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onUpdateTask={(updatedTask) => {
          onUpdateStatus(updatedTask.id, updatedTask.status);
          // This would be handled by the parent component
          // We're just closing the modal here
          setIsEditModalOpen(false);
        }}
      />
    </>
  );
}
