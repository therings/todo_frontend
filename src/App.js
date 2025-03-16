import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Container,
  CircularProgress,
  Box,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import axios from "axios";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoItem from "./components/TodoItem";
import ColumnSelector from "./components/ColumnSelector";
import DarkModeToggle from "./components/DarkModeToggle";
import SortButton from "./components/SortButton";
import Sidebar from "./components/Sidebar";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

console.log("API URL:", API_URL);

function App() {
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

  useEffect(() => {
    fetchTodos();
    fetchDeletedTodos();
  }, []);

  const fetchDeletedTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/deleted-todos`);
      setDeletedTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch deleted todos:", error);
    }
  };

  const fetchTodos = async () => {
    const url = `${API_URL}/todos`;
    console.log("Fetching from:", url);
    setLoading(true);
    try {
      const response = await axios.get(url);
      setTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (error.response) {
        console.error(
          "Error response:",
          error.response.status,
          error.response.data,
          "URL used:",
          url
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    const url = `${API_URL}/todos`;
    const tempId = Date.now().toString();
    const newTodo = {
      id: tempId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);

    try {
      const response = await axios.post(url, {
        title,
        createdAt: newTodo.createdAt,
      });

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === tempId
            ? {
                ...response.data,
                id: String(response.data.id),
              }
            : todo
        )
      );
    } catch (error) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== tempId));
      console.error("Failed to add task:", error);
    }
  };

  const toggleTodo = async (id) => {
    const url = `${API_URL}/todos/${id}`;
    const currentTodo = todos.find((t) => t.id === id);
    if (!currentTodo) return;

    const newCompleted = !currentTodo.completed;

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
      const response = await axios.put(url, {
        completed: newCompleted,
      });

      // Update the todo with the server response
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
      // Revert changes if the request fails
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
      console.error("Failed to update status:", error);
    }
  };

  const deleteTodo = async (id) => {
    const url = `${API_URL}/todos/${id}`;
    if (!id) {
      console.error("Failed to delete: Invalid ID");
      return;
    }

    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    try {
      // First, create a deleted todo record
      const deletedTodo = {
        ...todoToDelete,
        originalId: todoToDelete.id,
        deletedAt: new Date().toISOString(),
      };

      const deletedResponse = await axios.post(
        `${API_URL}/deleted-todos`,
        deletedTodo
      );
      setDeletedTodos((prev) => [deletedResponse.data, ...prev]);

      // Then delete the original todo
      await axios.delete(url);
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));

      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error.response?.data || error.message);
      await fetchTodos();
    }
  };

  const restoreTodo = async (id) => {
    const todoToRestore = deletedTodos.find((t) => t.id === id);
    if (!todoToRestore) return;

    try {
      // First create a new active todo
      const { _id, deletedAt, originalId, ...todoData } = todoToRestore;
      const response = await axios.post(`${API_URL}/todos`, todoData);
      setTodos((prev) => [response.data, ...prev]);

      // Then delete the todo from deleted todos
      await axios.delete(`${API_URL}/deleted-todos/${id}`);
      setDeletedTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to restore todo:", error);
    }
  };

  const permanentlyDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/deleted-todos/${id}`);
      setDeletedTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to permanently delete todo:", error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const theme = {
    background: darkMode ? "#121212" : "#f5f7fa",
    text: darkMode ? "#fff" : "#2c3e50",
    border: darkMode ? "#424242" : "#e1e5eb",
  };

  const handleCardClick = (todo) => {
    setSelectedTodo(todo);
  };

  const updateTodo = async (id, newTitle) => {
    const url = `${API_URL}/todos/${id}`;
    try {
      const response = await axios.put(url, {
        title: newTitle,
        updatedAt: new Date().toISOString(),
      });
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
    const todosToSort =
      currentView === "completed"
        ? todos.filter((todo) => todo.completed)
        : currentView === "deleted"
        ? deletedTodos
        : todos.filter((todo) => !todo.completed);

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
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Toolbar>
      </AppBar>

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        theme={theme}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />

      <Box
        component={motion.div}
        animate={{ marginLeft: isSidebarExpanded ? "200px" : "72px" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Container maxWidth="lg" sx={{ py: 10 }}>
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
              {currentView === "home" && <TodoForm onAdd={addTodo} />}
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
              />
              <Modal
                open={!!selectedTodo}
                onClose={() => setSelectedTodo(null)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
              >
                <Fade in={!!selectedTodo}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "80vw",
                      maxWidth: 600,
                      outline: "none",
                    }}
                  >
                    {selectedTodo && (
                      <TodoItem
                        todo={
                          todos.find((t) => t.id === selectedTodo.id) ||
                          deletedTodos.find((t) => t.id === selectedTodo.id)
                        }
                        onToggle={
                          currentView !== "deleted" ? toggleTodo : undefined
                        }
                        onDelete={
                          currentView === "deleted"
                            ? permanentlyDeleteTodo
                            : deleteTodo
                        }
                        onUpdate={
                          currentView !== "deleted" ? updateTodo : undefined
                        }
                        onRestore={
                          currentView === "deleted" ? restoreTodo : undefined
                        }
                        theme={theme}
                        isZoomed
                        isDeletedView={currentView === "deleted"}
                      />
                    )}
                  </Box>
                </Fade>
              </Modal>
            </>
          )}
        </Container>
      </Box>
    </div>
  );
}

export default App;
