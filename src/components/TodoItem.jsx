import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Typography,
  TextField,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HistoryIcon from "@mui/icons-material/History";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AssignSection from "./AssignSection";
import PropTypes from "prop-types";

const getItemColor = (view, isTemp) => {
  if (isTemp) {
    return "#FF9800"; // Orange for temporary items
  }

  switch (view) {
    case "home":
      return "#00C853"; // A more vibrant green
    case "completed":
      return "#2979FF"; // A brighter blue
    case "deleted":
      return "#FF1744"; // A brighter red
    default:
      return "#00C853"; // Default to the same green
  }
};

const MotionCard = motion.create(Card);

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  onRestore,
  theme,
  isZoomed,
  isDeletedView,
  assignedUsers = [],
  onAssign,
  onUnassign,
  onCardClick,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo?.title || "");
  const [isSaving, setIsSaving] = useState(false);

  // Check if this is a temporary todo item
  const isTemp = todo.id && todo.id.toString().startsWith("temp-");

  const currentView = isDeletedView
    ? "deleted"
    : todo.completed
    ? "completed"
    : "home";
  const currentColor = getItemColor(currentView, isTemp);

  // Get current user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser.id;

  // Check if the current user is assigned to this todo
  const isAssignedToMe = assignedUsers.some(
    (user) => String(user.id) === String(currentUserId)
  );

  // Check if current user is the todo owner
  const isOwner = String(todo.owner?.id) === String(currentUserId);

  // User can edit/delete if they are the owner OR assigned to the todo
  const hasEditPermission = isOwner || isAssignedToMe;

  // Debug permissions
  useEffect(() => {
    console.log("TodoItem - Permissions:", {
      todoId: todo.id,
      todoOwnerId: todo.owner?.id,
      currentUserId,
      isOwner,
      isAssignedToMe,
      hasEditPermission,
      assignedUsers,
      isTemp,
    });
  }, [
    todo,
    currentUserId,
    isOwner,
    isAssignedToMe,
    hasEditPermission,
    assignedUsers,
    isTemp,
  ]);

  if (!todo) return null;

  const handleStartEdit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsEditing(true);
    setEditedTitle(todo.title);
  };

  const handleSave = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsSaving(true);
    if (editedTitle.trim() !== todo.title) {
      await onUpdate(todo.id, editedTitle.trim());
    }
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete && onDelete(todo.id);
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRestore && onRestore(todo.id);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggle && onToggle(todo.id);
  };

  // Animation variants for temporary items
  const tempItemAnimation = {
    animate: isTemp
      ? {
          boxShadow: [
            "0 0 0 rgba(255, 152, 0, 0)",
            "0 0 5px rgba(255, 152, 0, 0.5)",
            "0 0 0 rgba(255, 152, 0, 0)",
          ],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
          },
        }
      : {},
  };

  return (
    <MotionCard
      elevation={isZoomed ? 8 : 1}
      animate={tempItemAnimation.animate}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        cursor: "pointer",
        backgroundColor: isTemp ? `${theme.background}` : theme.background,
        border: `1px solid ${isTemp ? currentColor : theme.border}`,
        boxShadow: isTemp ? `0 0 8px ${currentColor}40` : "none",
        opacity: isTemp ? 0.95 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: isZoomed ? "none" : "translateY(-4px)",
          boxShadow: (theme) =>
            isTemp
              ? `0 4px 12px ${currentColor}80`
              : theme.shadows[isZoomed ? 8 : 4],
        },
      }}
    >
      {isTemp && (
        <Box
          sx={{
            position: "absolute",
            top: "4px",
            right: "4px",
            backgroundColor: currentColor,
            color: "#fff",
            borderRadius: "4px",
            padding: "0px 6px",
            fontSize: "10px",
            fontWeight: "bold",
            opacity: 0.8,
            zIndex: 1,
          }}
        >
          Adding...
        </Box>
      )}
      <CardContent
        onClick={(e) => {
          // Don't open modal if clicking on interactive elements
          const isInteractive =
            e.target.closest("button") ||
            e.target.closest(".MuiCheckbox-root") ||
            e.target.closest(".MuiTextField-root") ||
            isEditing;

          if (isInteractive) {
            e.stopPropagation();
            return;
          }
          if (onCardClick) {
            onCardClick(todo);
          }
        }}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: isZoomed ? 3 : 2,
          "&:last-child": { pb: isZoomed ? 3 : 2 },
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
          {/* Always show checkbox for assigned users regardless of view */}
          {onToggle &&
            !isTemp &&
            (hasEditPermission || currentView === "assigned") && (
              <Checkbox
                checked={todo.completed}
                onChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  color: theme.text,
                  padding: "4px",
                  transition: "all 0.2s ease",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: `${currentColor}20`,
                    transform: "scale(1.08)",
                    boxShadow: `0 0 0 2px ${currentColor}50`,
                  },
                  "&.Mui-checked": {
                    color: currentColor,
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.3rem",
                  },
                }}
              />
            )}
          {/* Show spinner for temporary items instead of checkbox */}
          {isTemp && (
            <CircularProgress
              size={20}
              thickness={5}
              sx={{
                color: currentColor,
                ml: 1,
                mr: 1,
              }}
            />
          )}
          {isEditing ? (
            <TextField
              fullWidth
              multiline
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave(e);
                }
              }}
              autoFocus
              sx={{
                "& .MuiInputBase-input": {
                  color: theme.text,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.border,
                  },
                  "&:hover fieldset": {
                    borderColor: currentColor,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: currentColor,
                  },
                },
              }}
            />
          ) : (
            <Typography
              variant={isZoomed ? "h6" : "body1"}
              component="div"
              sx={{
                flex: 1,
                color: theme.text,
                textDecoration: todo.completed ? "line-through" : "none",
                wordBreak: "break-word",
                fontWeight: isTemp ? 500 : 400,
                fontStyle: isTemp ? "italic" : "normal",
              }}
            >
              {todo.title}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: "auto",
          }}
        >
          {/* Timestamps - Don't show for temporary items */}
          {!isTemp && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: theme.text }}>
                Created: {new Date(todo.createdAt).toLocaleString()}
              </Typography>
              {todo.updatedAt && (
                <Typography variant="caption" sx={{ color: theme.text }}>
                  Updated: {new Date(todo.updatedAt).toLocaleString()}
                </Typography>
              )}
              {todo.completedAt && (
                <Typography variant="caption" sx={{ color: theme.text }}>
                  Completed: {new Date(todo.completedAt).toLocaleString()}
                </Typography>
              )}
              {todo.deletedAt && (
                <Typography variant="caption" sx={{ color: theme.text }}>
                  Deleted: {new Date(todo.deletedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}

          {/* Assignment Section for zoomed view - don't show for temporary items */}
          {!isDeletedView && !isTemp && isZoomed && (
            <>
              <Divider sx={{ borderColor: theme.border }} />
              <AssignSection
                todo={todo}
                assignedUsers={assignedUsers}
                onAssign={onAssign}
                onUnassign={onUnassign}
                theme={theme}
                isCompact={false}
              />
            </>
          )}

          {/* Bottom Actions Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            {/* Left side - AssignSection - don't show for temporary items */}
            {!isDeletedView && !isTemp && !isZoomed && (
              <Box sx={{ flex: 1 }}>
                <AssignSection
                  todo={todo}
                  assignedUsers={assignedUsers}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                  theme={theme}
                  isCompact={true}
                />
              </Box>
            )}

            {/* Right side - Action buttons - don't show most buttons for temporary items */}
            <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
              {/* Edit button - show if not editing, has onUpdate, not completed, and has permission */}
              {!isEditing &&
                onUpdate &&
                !todo.completed &&
                !isTemp &&
                hasEditPermission && (
                  <IconButton
                    size="small"
                    onClick={handleStartEdit}
                    sx={{
                      color: currentColor,
                      opacity: 0.8,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: `${currentColor}20`,
                        transform: "scale(1.15)",
                        boxShadow: `0 2px 4px ${currentColor}40`,
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              {isEditing && (
                <IconButton
                  size="small"
                  onClick={handleSave}
                  disabled={isSaving}
                  sx={{
                    color: currentColor,
                    opacity: 0.8,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: `${currentColor}20`,
                      transform: "scale(1.15)",
                      boxShadow: `0 2px 4px ${currentColor}40`,
                    },
                  }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
              )}
              {/* Restore button - always show for any user in deleted view */}
              {onRestore && !isTemp && (
                <IconButton
                  size="small"
                  onClick={handleRestore}
                  sx={{
                    color: currentColor,
                    opacity: 0.8,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      opacity: 1,
                      backgroundColor: `${currentColor}20`,
                      transform: "scale(1.15)",
                      boxShadow: `0 2px 4px ${currentColor}40`,
                    },
                  }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              )}
              {/* Delete button - always show for assigned users and in deleted view */}
              {onDelete &&
                !isTemp &&
                (hasEditPermission ||
                  currentView === "assigned" ||
                  isDeletedView) && (
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    sx={{
                      color: currentColor,
                      opacity: 0.8,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        opacity: 1,
                        backgroundColor: `${currentColor}20`,
                        transform: "scale(1.15)",
                        boxShadow: `0 2px 4px ${currentColor}40`,
                      },
                    }}
                  >
                    {isDeletedView ? (
                      <DeleteForeverIcon fontSize="small" />
                    ) : (
                      <DeleteIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.object.isRequired,
  onToggle: PropTypes.func,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onRestore: PropTypes.func,
  theme: PropTypes.object.isRequired,
  isZoomed: PropTypes.bool,
  isDeletedView: PropTypes.bool,
  assignedUsers: PropTypes.array,
  onAssign: PropTypes.func,
  onUnassign: PropTypes.func,
  onCardClick: PropTypes.func,
};
