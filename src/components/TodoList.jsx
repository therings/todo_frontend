import Box from "@mui/material/Box";
import TodoItem from "./TodoItem";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

// Custom scrollbar styles based on theme
const getScrollbarStyles = (theme) => {
  const scrollbarColor =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.2)";

  const scrollbarColorHover =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

  return {
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
    // Firefox scrollbar
    scrollbarWidth: "thin",
    scrollbarColor: `${scrollbarColor} transparent`,
  };
};

const TodoList = ({
  todos = [],
  onToggle,
  onDelete,
  onUpdate,
  onRestore,
  theme,
  columns,
  onCardClick,
  isDeletedView,
  assignedUsers,
  onAssign,
  onUnassign,
}) => {
  // Add console.log to debug
  console.log("Received todos:", todos);

  const todoArray = Array.isArray(todos) ? todos : [];
  console.log("Processed todoArray:", todoArray);

  return (
    <Box
      sx={{
        mt: 2,
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr", // 1 column on mobile
          sm:
            columns === 1
              ? "1fr" // 1 column if selected
              : columns === 2
              ? "repeat(2, 1fr)" // 2 columns if selected
              : columns === 3
              ? "repeat(3, 1fr)" // 3 columns if selected
              : "repeat(4, 1fr)", // 4 columns if selected
        },
        padding: 2,
        maxHeight: "calc(100vh - 200px)",
        overflowY: "auto",
        ...getScrollbarStyles(theme),
        "& > *": {
          // This ensures all direct children (the todo items) maintain consistent height
          height: "100%",
          "& > *": {
            // This targets the Card components inside motion.div
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <AnimatePresence mode="wait">
        {todoArray.map((todo) => (
          <motion.div
            key={todo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
              mass: 0.5,
            }}
            layout="position"
            onClick={() => onCardClick(todo)}
            style={{ height: "100%" }} // Ensure motion.div takes full height
          >
            <TodoItem
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onRestore={onRestore}
              theme={theme}
              isDeletedView={isDeletedView}
              assignedUsers={assignedUsers?.[todo.id] || []}
              onAssign={onAssign}
              onUnassign={onUnassign}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
};

TodoList.propTypes = {
  // Add todos validation
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      // Add other todo properties as needed
    })
  ),
  onToggle: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onRestore: PropTypes.func,
  theme: PropTypes.shape({
    background: PropTypes.string,
    text: PropTypes.string,
    border: PropTypes.string,
  }).isRequired,
  onCardClick: PropTypes.func.isRequired,
  columns: PropTypes.number.isRequired,
  isDeletedView: PropTypes.bool,
  assignedUsers: PropTypes.object,
  onAssign: PropTypes.func,
  onUnassign: PropTypes.func,
};

export default TodoList;
