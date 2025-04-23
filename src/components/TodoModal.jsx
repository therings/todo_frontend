import { Box, IconButton, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TodoItem from "./TodoItem";
import CommentSection from "./CommentSection";
import { useMemo } from "react";
import PropTypes from "prop-types";

export default function TodoModal({
  selectedTodo,
  onClose,
  todos,
  deletedTodos,
  currentView,
  onToggle,
  onDelete,
  onUpdate,
  onRestore,
  theme,
  isSidebarExpanded,
  comments = [],
  onAddComment,
  onDeleteComment,
  assignedUsers = [],
  onAssign,
  onUnassign,
}) {
  // Determine the todo's view state when modal was opened
  const todoView = useMemo(() => {
    if (!selectedTodo) return null;
    const isInDeleted = deletedTodos.some((t) => t.id === selectedTodo.id);
    if (isInDeleted) return "deleted";
    const todo = todos.find((t) => t.id === selectedTodo.id);
    return todo?.completed ? "completed" : "home";
  }, [selectedTodo, todos, deletedTodos]);

  if (!selectedTodo || !todoView) return null;

  // Get the correct todo from the appropriate list
  const todo =
    todoView === "deleted"
      ? deletedTodos.find((t) => t.id === selectedTodo.id)
      : todos.find((t) => t.id === selectedTodo.id);

  // Custom scrollbar styles based on theme
  const scrollbarColor =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.2)";

  const scrollbarColorHover =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

  // Check if the current todo is assigned to me
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser.id;
  const isAssignedToMe = assignedUsers.some(
    (user) => String(user.id) === String(currentUserId)
  );

  // Whether the todo is in the assigned view
  const isInAssignedView = currentView === "assigned";

  return (
    <Box
      sx={{
        position: "fixed",
        top: "64px",
        left: isSidebarExpanded ? "190px" : "72px",
        right: 0,
        bottom: 0,
        display: "flex",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1200,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr minmax(350px, 400px)",
          backgroundColor: theme.background,
          overflow: "hidden",
          position: "relative",
          maxHeight: "100%",
        }}
      >
        <Box
          sx={{
            overflow: "auto",
            position: "relative",
            height: "100%",
            maxHeight: "calc(100vh - 64px)",
            // Custom scrollbar styling
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
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: "16px",
              top: "16px",
              zIndex: 1,
              color: theme.text,
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <TodoItem
            todo={todo}
            onToggle={todoView !== "deleted" ? onToggle : undefined}
            onDelete={onDelete}
            onUpdate={todoView !== "deleted" ? onUpdate : undefined}
            onRestore={todoView === "deleted" ? onRestore : undefined}
            theme={theme}
            isZoomed
            isDeletedView={todoView === "deleted"}
            assignedUsers={assignedUsers}
            onAssign={todoView !== "deleted" ? onAssign : undefined}
            onUnassign={todoView !== "deleted" ? onUnassign : undefined}
            onCardClick={() => {}} // Empty function to prevent handling clicks in modal
          />
        </Box>
        <Box
          sx={{
            borderLeft: `1px solid ${theme.border}`,
            backgroundColor:
              theme.background === "#121212"
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.01)",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CommentSection
            todoId={todo.id}
            todo={todo}
            comments={comments}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            theme={theme}
          />
        </Box>
      </Box>
    </Box>
  );
}

TodoModal.propTypes = {
  selectedTodo: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  todos: PropTypes.array.isRequired,
  deletedTodos: PropTypes.array.isRequired,
  currentView: PropTypes.string.isRequired,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onRestore: PropTypes.func,
  theme: PropTypes.object.isRequired,
  isSidebarExpanded: PropTypes.bool.isRequired,
  comments: PropTypes.array,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  assignedUsers: PropTypes.array,
  onAssign: PropTypes.func,
  onUnassign: PropTypes.func,
};
