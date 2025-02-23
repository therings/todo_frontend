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

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title) => {
    try {
      const response = await axios.post(API_URL, { title });
      setTodos((prev) => [
        ...prev,
        {
          ...response.data,
          id: String(response.data.id),
        },
      ]);
    } catch (error) {
      console.error("添加任务失败:", error);
    }
  };

  const toggleTodo = async (id) => {
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
      await axios.put(`${API_URL}/${id}`, {
        completed: !currentTodo.completed, // Use the current todo's completion status
      });
    } catch (error) {
      // Revert the optimistic update if the API call fails
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: currentTodo.completed } : todo
        )
      );
      console.error("更新状态失败:", error);
    }
  };

  const deleteTodo = async (id) => {
    if (!id) {
      console.error("删除失败: 无效的ID");
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((t) => t.id !== id));

      // Clear selectedTodo if deleting the currently viewed todo
      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      console.error("删除失败:", error.response?.data || error.message);
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
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <ColumnSelector
                columns={columns}
                onChange={setColumns}
                theme={theme}
              />
            </Box>
            <TodoForm onAdd={addTodo} />
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
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
