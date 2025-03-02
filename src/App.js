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

const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

console.log("API URL:", API_URL);

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [columns, setColumns] = useState(3);
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    fetchTodos();
  }, []);

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
    const tempId = Date.now().toString(); // Temporary ID for optimistic update
    const newTodo = {
      id: tempId,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update - add todo to state immediately
    setTodos((prev) => [newTodo, ...prev]);

    try {
      const response = await axios.post(url, {
        title,
        createdAt: newTodo.createdAt,
      });

      // Update the temporary todo with the real one from server
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
      // If the API call fails, remove the temporary todo
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== tempId));
      console.error("Failed to add task:", error);
    }
  };

  const toggleTodo = async (id) => {
    const url = `${API_URL}/todos/${id}`;
    // Find the current todo to toggle its completion status
    const currentTodo = todos.find((t) => t.id === id);
    if (!currentTodo) return; // Early return if todo not found

    // Optimistic update
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );

    try {
      await axios.put(url, {
        completed: !currentTodo.completed,
      });
    } catch (error) {
      // Revert the optimistic update if the API call fails
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: currentTodo.completed } : todo
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

    try {
      // Optimistic update - remove todo from state immediately
      setTodos((prevTodos) => prevTodos.filter((t) => t.id !== id));

      // Clear selectedTodo if deleting the currently viewed todo
      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }

      // Make the API call after updating the UI
      await axios.delete(url);
    } catch (error) {
      // If the API call fails, revert the deletion by fetching todos again
      console.error("Failed to delete:", error.response?.data || error.message);
      await fetchTodos();
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const theme = {
    background: darkMode ? "#121212" : "#fff",
    text: darkMode ? "#fff" : "#000",
    border: darkMode ? "#424242" : "#e0e0e0",
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
      // If clicking the same sort field, toggle the direction
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      // If changing the sort field, set it and default to desc order
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  const getSortedTodos = () => {
    return [...todos].sort((a, b) => {
      // First sort by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Completed items go to the end
      }

      // Then sort by date within each group (completed/uncompleted)
      if (sortBy === "updatedAt") {
        // For "updatedAt" sorting, items with no updates should go after updated items
        if (!a.updatedAt && !b.updatedAt) {
          // If neither has updates, sort by creation date
          return sortOrder === "desc"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        }

        // If only one has updateAt, the updated one should come first
        if (!a.updatedAt) return 1; // a goes after b
        if (!b.updatedAt) return -1; // a goes before b

        // If both have updateAt, compare them
        return sortOrder === "desc"
          ? new Date(b.updatedAt) - new Date(a.updatedAt)
          : new Date(a.updatedAt) - new Date(b.updatedAt);
      } else {
        // For "createdAt" sorting
        return sortOrder === "desc"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      }
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
        position="static"
        color="default"
        sx={{
          bgcolor: darkMode ? "#1e1e1e" : "#f5f5f5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: theme.text }}>
            Todo Manager
          </Typography>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              />
            </Box>
            <TodoForm onAdd={addTodo} />
            <TodoList
              todos={getSortedTodos()}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
              theme={theme}
              columns={columns}
              onCardClick={handleCardClick}
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
                      todo={todos.find((t) => t.id === selectedTodo.id)}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      theme={theme}
                      isZoomed
                    />
                  )}
                </Box>
              </Fade>
            </Modal>
          </>
        )}
      </Container>
    </div>
  );
}

export default App;
