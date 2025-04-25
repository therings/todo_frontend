import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginAndRegister from "./pages/LoginAndRegister";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Container,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "axios";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoModal from "./components/TodoModal";
import ColumnSelector from "./components/ColumnSelector";
import SortButton from "./components/SortButton";
import Sidebar from "./components/Sidebar";
import { motion } from "framer-motion";
import ProfilePicture from "./components/ProfilePicture";

const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-test-beta.vercel.app";

console.log("API URL:", API_URL);

// Create a CSS style block for the custom scrollbar
const createCustomScrollbarStyles = (isDarkMode) => {
  const scrollbarColor = isDarkMode
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(0, 0, 0, 0.2)";

  const scrollbarColorHover = isDarkMode
    ? "rgba(255, 255, 255, 0.3)"
    : "rgba(0, 0, 0, 0.3)";

  return {
    // For WebKit browsers (Chrome, Safari, etc.)
    "&::-webkit-scrollbar": {
      width: "8px",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: scrollbarColor,
      borderRadius: "4px",
      transition: "background 0.2s ease",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: scrollbarColorHover,
    },
    // For Firefox
    scrollbarWidth: "thin",
    scrollbarColor: `${scrollbarColor} transparent`,
  };
};

function AppContent() {
  const [todos, setTodos] = useState([]);
  const [deletedTodos, setDeletedTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [columns, setColumns] = useState(3);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentView, setCurrentView] = useState("home");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [comments, setComments] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState({});

  useEffect(() => {
    fetchTodos();
    fetchDeletedTodos();
  }, []);

  const fetchDeletedTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      const response = await axios.get(`${API_URL}/api/deleted-todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletedTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch deleted todos:", error);
    }
  };

  const fetchTodos = async () => {
    const url = `${API_URL}/api/todos`;
    console.log("Fetching from:", url);
    setLoading(true);
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch both created and assigned todos
      console.log("Starting to fetch todos...");

      // First, try to get created todos
      let createdTodos = [];
      try {
        const createdResponse = await axios.get(`${url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        createdTodos = createdResponse.data;
        console.log("Created todos fetched successfully:", createdTodos);
      } catch (error) {
        console.error(
          "Error fetching created todos:",
          error.response?.data || error.message
        );
      }

      // Then, try to get assigned todos
      let assignedTodos = [];
      try {
        // Get all todos first
        const allTodosResponse = await axios.get(`${url}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Then check which ones are assigned to the current user
        const assignedPromises = allTodosResponse.data.map(async (todo) => {
          try {
            const assignedResponse = await axios.get(
              `${url}/${todo.id}/assigned`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const assignedUsers = assignedResponse.data;
            // Update the assignedUsers state for this todo
            setAssignedUsers((prev) => ({
              ...prev,
              [todo.id]: assignedUsers,
            }));
            // If the current user is in the assigned users list, include this todo
            if (
              assignedUsers.some(
                (user) => user.id === localStorage.getItem("userId")
              )
            ) {
              return { ...todo, isAssigned: true };
            }
            return null;
          } catch (error) {
            console.error(
              `Error checking assignments for todo ${todo.id}:`,
              error
            );
            return null;
          }
        });

        const assignedResults = await Promise.all(assignedPromises);
        assignedTodos = assignedResults.filter((todo) => todo !== null);
        console.log("Assigned todos fetched successfully:", assignedTodos);
      } catch (error) {
        console.error(
          "Error fetching assigned todos:",
          error.response?.data || error.message
        );
        if (error.response) {
          console.error("Assigned todos error details:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        }
      }

      // Combine and deduplicate todos
      const allTodos = [...createdTodos, ...assignedTodos].reduce(
        (unique, todo) => {
          // Ensure todo has an id and it's a string
          if (!todo || !todo.id) {
            console.warn("Found todo without id:", todo);
            return unique;
          }
          const todoId = String(todo.id);
          const exists = unique.find((t) => String(t.id) === todoId);
          if (!exists) {
            unique.push({
              ...todo,
              id: todoId,
              isAssigned: todo.isAssigned || false,
            });
          } else if (todo.isAssigned) {
            // If the todo exists but this one is assigned, update the existing one
            // to mark it as assigned
            const index = unique.findIndex((t) => String(t.id) === todoId);
            unique[index] = {
              ...unique[index],
              isAssigned: true,
            };
          }
          return unique;
        },
        []
      );

      console.log("Final combined todos:", allTodos);
      setTodos(allTodos);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data
        );
      }
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const url = `${API_URL}/api/todos`;
    const tempId = `temp-${Date.now()}`;
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const newTodo = {
      id: tempId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      owner: {
        id: storedUser.id,
        name: storedUser.name,
        avatar: storedUser.picture,
      },
      // Flag to indicate this is a temporary todo
      isTemp: true,
    };

    // Add to local state first (optimistic update)
    setTodos((prev) => [newTodo, ...prev]);

    try {
      // Wait a brief moment to avoid rapid re-renders
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Make API call
      const response = await axios.post(
        url,
        {
          title,
          createdAt: newTodo.createdAt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Replace temporary todo with actual one from server
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === tempId
            ? {
                ...response.data,
                id: String(response.data.id),
                owner: response.data.owner || newTodo.owner,
              }
            : todo
        )
      );
    } catch (error) {
      // Remove the temporary todo on error
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== tempId));
      console.error("Failed to add task:", error);
    }
  };

  const toggleTodo = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const currentTodo = todos.find((t) => t.id === id);
    if (!currentTodo) return;

    // Get current user ID
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser.id;

    // Check if this is an assigned todo
    const todoAssignedUsers = assignedUsers[id] || [];
    const isAssignedToMe = todoAssignedUsers.some(
      (user) => String(user.id) === String(currentUserId)
    );

    // Check if current user is the owner
    const isOwner = String(currentTodo.owner?.id) === String(currentUserId);

    // Set URL based on ownership/assignment - standard endpoint should work for both,
    // but we're adding specific handling in case the backend route changes
    const url = `${API_URL}/api/todos/${id}`;

    const newCompleted = !currentTodo.completed;

    // Optimistically update the UI
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: newCompleted,
              completedAt: newCompleted ? new Date().toISOString() : null,
            }
          : todo
      )
    );

    try {
      console.log("Toggling todo:", {
        id,
        isAssignedToMe,
        isOwner,
        url,
        newCompleted,
      });

      // Add detailed request logging
      const response = await axios.put(
        url,
        {
          completed: newCompleted,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the UI with the response data
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: response.data.completed,
                completedAt: response.data.completedAt,
                updatedAt: response.data.updatedAt,
              }
            : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo status:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        url,
        todoId: id,
        isAssignedToMe,
        isOwner,
      });

      // If we get a 404 error for an assigned todo, try an alternative approach
      if (error.response?.status === 404 && isAssignedToMe && !isOwner) {
        try {
          console.log("Attempting alternative API endpoint for assigned todo");
          // Try with assigned endpoint
          const assignedUrl = `${API_URL}/api/todos/${id}/assigned/${currentUserId}/complete`;
          const altResponse = await axios.put(
            assignedUrl,
            { completed: newCompleted },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update the UI with the response data
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === id
                ? {
                    ...todo,
                    completed: altResponse.data.completed || newCompleted,
                    completedAt:
                      altResponse.data.completedAt ||
                      (newCompleted ? new Date().toISOString() : null),
                    updatedAt:
                      altResponse.data.updatedAt || new Date().toISOString(),
                  }
                : todo
            )
          );
          return;
        } catch (altError) {
          console.error("Alternative approach also failed:", altError);
        }
      }

      // Revert the optimistic UI update
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: currentTodo.completed,
                completedAt: currentTodo.completedAt,
              }
            : todo
        )
      );
    }
  };

  const deleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    if (!id) {
      console.error("Failed to delete: Invalid ID");
      return;
    }

    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    // Get current user ID
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser.id;

    // Check if current user is the owner of the todo
    const isOwner = String(todoToDelete.owner?.id) === String(currentUserId);

    // Check if user is assigned to this todo
    const todoAssignedUsers = assignedUsers[id] || [];
    const isAssignedToMe = todoAssignedUsers.some(
      (user) => String(user.id) === String(currentUserId)
    );

    console.log("Delete permissions:", { id, isOwner, isAssignedToMe });

    try {
      // First try to delete the todo
      const url = `${API_URL}/api/todos/${id}`;
      let deleteSuccess = false;

      try {
        // If user is owner, use regular delete endpoint
        if (isOwner) {
          await axios.delete(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          deleteSuccess = true;
        }
        // If user is assigned but not owner, try the unassign endpoint
        else if (isAssignedToMe) {
          const unassignUrl = `${API_URL}/api/todos/${id}/assign/${currentUserId}`;
          await axios.delete(unassignUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          deleteSuccess = true;
        }
      } catch (deleteError) {
        console.error(
          "Error deleting todo:",
          deleteError.response?.data || deleteError.message
        );
        throw deleteError; // Re-throw to be caught by outer catch
      }

      // If deletion was successful, add to deleted todos if we're the owner
      if (deleteSuccess && isOwner) {
        const deletedTodo = {
          ...todoToDelete,
          originalId: todoToDelete.id,
          deletedAt: new Date().toISOString(),
        };

        const deletedResponse = await axios.post(
          `${API_URL}/api/deleted-todos`,
          deletedTodo,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDeletedTodos((prev) => [deletedResponse.data, ...prev]);
      }

      // Update UI
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));

      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error.response?.data || error.message);
      // Refresh todos to ensure UI is in sync with server
      await fetchTodos();
    }
  };

  const restoreTodo = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const todoToRestore = deletedTodos.find((t) => t.id === id);
    if (!todoToRestore) return;

    try {
      const { _id, deletedAt, originalId, ...todoData } = todoToRestore;
      const response = await axios.post(`${API_URL}/api/todos`, todoData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodos((prev) => [response.data, ...prev]);

      await axios.delete(`${API_URL}/api/deleted-todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletedTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to restore todo:", error);
    }
  };

  const permanentlyDeleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/deleted-todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeletedTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to permanently delete todo:", error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    // Dispatch custom event for dark mode change
    window.dispatchEvent(new Event("darkModeChange"));
  };

  const theme = {
    background: darkMode ? "#121212" : "#f5f7fa",
    text: darkMode ? "#fff" : "#2c3e50",
    border: darkMode ? "#424242" : "#e1e5eb",
  };

  const fetchComments = async (todoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/todos/${todoId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const addComment = async (todoId, content) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/todos/${todoId}/comments`,
        {
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments((prevComments) => [response.data, ...prevComments]);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const deleteComment = async (todoId, commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      console.log("Sending delete comment request:", {
        todoId,
        commentId,
        url: `${API_URL}/api/todos/${todoId}/comments/${commentId}`,
      });

      await axios.delete(
        `${API_URL}/api/todos/${todoId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Comment deleted successfully:", { todoId, commentId });

      // Optimistically update the UI
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete comment:", {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        todoId,
        commentId,
      });

      // You could add toast notification here in a real app
      if (error.response?.status === 403) {
        alert("You don't have permission to delete this comment");
      } else if (error.response?.status === 404) {
        alert("Comment not found. It might have been already deleted.");
        // Still update the UI if comment is not found
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      } else {
        alert("Failed to delete comment. Please try again.");
      }
    }
  };

  const fetchAssignedUsers = async (todoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/todos/${todoId}/assigned`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAssignedUsers((prev) => ({
        ...prev,
        [todoId]: response.data,
      }));
    } catch (error) {
      console.error("Failed to fetch assigned users:", error);
    }
  };

  const handleAssign = async (todoId, userId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/todos/${todoId}/assign/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the assignedUsers state with the new data
      setAssignedUsers((prev) => ({
        ...prev,
        [todoId]: response.data,
      }));

      // Refresh the todo list to reflect the changes
      await fetchTodos();
    } catch (error) {
      console.error("Failed to assign user:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error
        console.error("Authentication failed");
      }
    }
  };

  const handleUnassign = async (todoId, userId) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/api/todos/${todoId}/assign/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the assignedUsers state with the new data
      setAssignedUsers((prev) => ({
        ...prev,
        [todoId]: response.data,
      }));

      // Refresh the todo list to reflect the changes
      await fetchTodos();
    } catch (error) {
      console.error("Failed to unassign user:", error);
      if (error.response?.status === 401) {
        // Handle unauthorized error
        console.error("Authentication failed");
      }
    }
  };

  const handleCardClick = (todo) => {
    setSelectedTodo(todo);
    fetchComments(todo.id);
    fetchAssignedUsers(todo.id);
  };

  const updateTodo = async (id, newTitle) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const url = `${API_URL}/api/todos/${id}`;
    try {
      const response = await axios.put(
        url,
        {
          title: newTitle,
          updatedAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                title: newTitle,
                updatedAt: response.data.updatedAt,
              }
            : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const getSortedTodos = () => {
    let todosToSort = [];

    // Get current user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser.id;

    // Filter todos based on current view
    if (currentView === "completed") {
      todosToSort = todos.filter((todo) => todo.completed);
    } else if (currentView === "deleted") {
      todosToSort = deletedTodos;
    } else if (currentView === "assigned") {
      // Show todos assigned to the current user that are not completed
      todosToSort = todos.filter((todo) => {
        const todoAssignedUsers = assignedUsers[todo.id] || [];
        const isAssignedToMe = todoAssignedUsers.some(
          (user) => String(user.id) === String(currentUserId)
        );
        return isAssignedToMe && !todo.completed;
      });
    } else {
      // Home view - show non-completed todos that are NOT assigned to the current user
      todosToSort = todos.filter((todo) => {
        const todoAssignedUsers = assignedUsers[todo.id] || [];
        const isAssignedToMe = todoAssignedUsers.some(
          (user) => String(user.id) === String(currentUserId)
        );
        return !todo.completed && !isAssignedToMe;
      });
    }

    return [...todosToSort].sort((a, b) => {
      const getDateValue = (todo, field) => {
        if (!todo[field]) {
          return field === "createdAt" ? new Date(todo.createdAt) : new Date(0);
        }
        return new Date(todo[field]);
      };

      const dateA = getDateValue(a, sortBy);
      const dateB = getDateValue(b, sortBy);

      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        color="default"
        sx={{
          bgcolor: darkMode ? "#1e1e1e" : "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderBottom: `1px solid ${theme.border}`,
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.text }}>
            Todo Manager
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ProfilePicture />
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedTodo(null);
          setComments([]);
        }}
        theme={theme}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <Box
        component={motion.div}
        animate={{
          marginLeft: isSidebarExpanded ? "200px" : "72px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        id="main-content"
        sx={{
          height: "100vh",
          overflowY: "auto",
          ...createCustomScrollbarStyles(darkMode),
        }}
      >
        <Container maxWidth="false" sx={{ py: 10 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <ColumnSelector
                    columns={columns}
                    onChange={setColumns}
                    theme={theme}
                  />
                </Box>
                <SortButton
                  sortOrder={sortOrder}
                  sortBy={sortBy}
                  onSort={handleSort}
                  theme={theme}
                  currentView={currentView}
                />
              </Box>
              {(currentView === "home" || currentView === "assigned") && (
                <TodoForm onAdd={addTodo} />
              )}
              <TodoList
                todos={getSortedTodos()}
                onToggle={currentView !== "deleted" ? toggleTodo : undefined}
                onDelete={
                  currentView === "deleted" ? permanentlyDeleteTodo : deleteTodo
                }
                onUpdate={currentView !== "deleted" ? updateTodo : undefined}
                onRestore={currentView === "deleted" ? restoreTodo : undefined}
                theme={theme}
                columns={columns}
                onCardClick={handleCardClick}
                isDeletedView={currentView === "deleted"}
                assignedUsers={assignedUsers}
                onAssign={currentView !== "deleted" ? handleAssign : undefined}
                onUnassign={
                  currentView !== "deleted" ? handleUnassign : undefined
                }
              />
              <TodoModal
                selectedTodo={selectedTodo}
                onClose={() => {
                  setSelectedTodo(null);
                  setComments([]);
                }}
                todos={todos}
                deletedTodos={deletedTodos}
                currentView={currentView}
                onToggle={toggleTodo}
                onDelete={
                  currentView === "deleted" ? permanentlyDeleteTodo : deleteTodo
                }
                onUpdate={updateTodo}
                onRestore={restoreTodo}
                theme={theme}
                isSidebarExpanded={isSidebarExpanded}
                comments={comments}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                assignedUsers={
                  selectedTodo ? assignedUsers[selectedTodo.id] || [] : []
                }
                onAssign={handleAssign}
                onUnassign={handleUnassign}
              />
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="654471561523-pvpog1r81h6s5je3huivg4jfhj635qsc.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginAndRegister />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
