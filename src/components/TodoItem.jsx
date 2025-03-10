import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import UpdateTodoButton from "./UpdateTodoButton";
import { useState } from "react";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  onRestore,
  theme,
  isZoomed,
  isDeletedView,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo?.title || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!todo) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(todo.title);
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (editedTitle.trim() !== todo.title) {
      await onUpdate(todo.id, editedTitle.trim());
    }
    setIsEditing(false);
    setIsSaving(false);
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onRestore(todo.id);
  };

  return (
    <Card
      onClick={(e) => {
        if (!e.target.closest("button")) {
          e.preventDefault();
          if (isZoomed) {
            // Handle zoom logic here
          }
        }
      }}
      sx={{
        position: "relative",
        transform: "none !important",
        transition: "none !important",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        m: isZoomed ? 0 : 1,
        bgcolor: isZoomed
          ? `${theme.background} !important`
          : theme.background === "#121212"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.08)",
        border: `1px solid ${theme.border}`,
        background: isZoomed
          ? "none"
          : theme.background === "#121212"
          ? "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.08))"
          : "linear-gradient(145deg, rgba(0,0,0,0.08), rgba(0,0,0,0.06))",
        boxShadow: isZoomed ? 24 : 2,
        "&:hover": {
          transform: "none !important",
        },
        margin: "0",
        padding: "16px",
        maxHeight: "500px",
        overflow: "auto",
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "4px",
        },
      }}
    >
      <CardContent sx={{ p: isZoomed ? 4 : 2 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            height: "100%",
            minHeight: 80,
            padding: "8px 0",
          }}
        >
          {!isDeletedView && (
            <Checkbox
              checked={todo.completed}
              onChange={(e) => {
                e.stopPropagation();
                onToggle(todo.id);
              }}
              onClick={(e) => e.stopPropagation()}
              sx={{
                color: theme.text + "!important",
                alignSelf: "flex-start",
                marginTop: "-8px",
                marginLeft: "-8px",
                "&.Mui-checked": {
                  color: theme.text + "!important",
                  opacity: 0.8,
                },
              }}
            />
          )}
          {isEditing ? (
            <TextField
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => {
                setTimeout(() => {
                  if (!isSaving) {
                    setIsEditing(false);
                    setEditedTitle(todo.title);
                  }
                }, 200);
              }}
              fullWidth
              autoFocus
              multiline
              maxRows={3}
              inputRef={(input) => {
                if (input) {
                  input.selectionStart = input.selectionEnd =
                    editedTitle.length;
                }
              }}
              sx={{
                flex: 1,
                ml: 1,
                mr: 2,
                "& .MuiInputBase-input": {
                  color: theme.text,
                  fontSize: isZoomed ? "1.5rem" : "1rem",
                  padding: "8px 14px",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.border,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.text,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.text,
                  },
                },
              }}
            />
          ) : (
            <Box sx={{ flex: 1, ml: isDeletedView ? 0 : 1 }}>
              <Typography
                sx={{
                  textAlign: "left",
                  alignSelf: "flex-start",
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: theme.text,
                  wordBreak: "break-word",
                  overflow: isZoomed ? "visible" : "hidden",
                  textOverflow: isZoomed ? "clip" : "ellipsis",
                  display: isZoomed ? "block" : "-webkit-box",
                  WebkitLineClamp: isZoomed ? "unset" : 3,
                  WebkitBoxOrient: isZoomed ? "horizontal" : "vertical",
                  fontSize: isZoomed ? "1.5rem" : "1rem",
                }}
              >
                {todo.title}
              </Typography>
              {isDeletedView && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.text,
                    opacity: 0.7,
                    display: "block",
                    mt: 1,
                  }}
                >
                  Deleted: {new Date(todo.deletedAt).toLocaleString()}
                </Typography>
              )}
              {todo.completed && todo.completedAt && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.text,
                    opacity: 0.7,
                    display: "block",
                    mt: 1,
                  }}
                >
                  Completed: {new Date(todo.completedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "auto",
              justifyContent: "space-between",
              height: "100%",
              minHeight: "80px",
            }}
          >
            {!isDeletedView && (
              <UpdateTodoButton
                todo={todo}
                theme={theme}
                onStartEdit={handleStartEdit}
                isEditing={isEditing}
                onSave={handleSave}
              />
            )}
            {isDeletedView ? (
              <>
                <IconButton
                  onClick={handleRestore}
                  sx={{
                    color: theme.text,
                  }}
                >
                  <RestoreIcon />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(todo.id);
                  }}
                  sx={{
                    color: theme.text,
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(todo.id);
                }}
                sx={{
                  color: theme.text,
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
