import {
  Box,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";

export default function CommentSection({
  todoId,
  todo,
  comments = [],
  onAddComment,
  onDeleteComment,
  theme,
}) {
  const [newComment, setNewComment] = useState("");

  // Get current user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser.id;

  // Check if current user is the todo owner
  const isOwner = todo && String(todo.owner?.id) === String(currentUserId);

  // Debug log for permissions
  useEffect(() => {
    console.log("CommentSection - Permissions:", {
      todoId,
      todoOwnerId: todo?.owner?.id,
      currentUserId,
      isOwner,
      commentsCount: comments.length,
    });
  }, [todoId, todo, currentUserId, isOwner, comments.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(todoId, newComment.trim());
      setNewComment("");
    }
  };

  // Handle comment deletion with detailed logging
  const handleDeleteComment = (todoId, commentId) => {
    console.log("Deleting comment:", {
      todoId,
      commentId,
      currentUserId,
      isOwner,
    });

    onDeleteComment(todoId, commentId);
  };

  // Check if user can delete a comment
  const canDeleteComment = (comment) => {
    // Users can delete their own comments
    const isOwnComment = String(comment.user.id) === String(currentUserId);

    // Todo owners can delete any comment on their todos
    const canDelete = isOwnComment || isOwner;

    console.log("Comment permission check:", {
      commentId: comment.id,
      commentOwnerId: comment.user.id,
      currentUserId,
      isOwnComment,
      isOwner,
      canDelete,
    });

    return canDelete;
  };

  // Custom scrollbar styles based on theme
  const scrollbarColor =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.2)";

  const scrollbarColorHover =
    theme.background === "#121212"
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(0, 0, 0, 0.3)";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
        p: 2,
        border: `1px solid ${theme.border}`,
        borderRadius: 1,
        backgroundColor:
          theme.background === "#121212"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
        overflow: "hidden",
      }}
    >
      <Typography variant="h6" sx={{ color: theme.text }}>
        Comments
      </Typography>

      {/* Comments list */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "calc(100vh - 220px)",
          minHeight: "100px",
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
        {comments.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100px",
              color: theme.textSecondary || theme.text,
              opacity: 0.7,
            }}
          >
            <Typography variant="body2">No comments yet</Typography>
          </Box>
        ) : (
          comments.map((comment) => (
            <Paper
              key={comment.id}
              elevation={0}
              sx={{
                p: 2,
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.02)",
                display: "flex",
                gap: 2,
                border: `1px solid ${theme.border}`,
                borderRadius: 1,
                transition: "border-color 0.2s ease",
                "&:hover": {
                  borderColor: `${theme.text}40`,
                },
              }}
            >
              <Avatar
                src={comment.user.avatar}
                alt={comment.user.name}
                sx={{ width: 32, height: 32, flexShrink: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{ overflow: "hidden", maxWidth: "calc(100% - 40px)" }}
                  >
                    <Typography variant="subtitle2" sx={{ color: theme.text }}>
                      {comment.user.name}
                      {String(comment.user.id) === String(todo?.owner?.id) && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            ml: 1,
                            color: "#FFC107",
                            fontWeight: "bold",
                            display: "inline-block",
                          }}
                        >
                          (Owner)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.text }}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {canDeleteComment(comment) && (
                    <Tooltip
                      title={
                        String(comment.user.id) === String(currentUserId)
                          ? "Delete your comment"
                          : "Delete comment"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteComment(todoId, comment.id)}
                        sx={{
                          color: theme.text,
                          "&:hover": {
                            opacity: 0.8,
                            color: "#f44336", // Red color on hover
                          },
                          flexShrink: 0,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.text,
                    mt: 1,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    backgroundColor:
                      theme.background === "#121212"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    p: 1.5,
                    borderRadius: 1,
                    overflowWrap: "break-word",
                  }}
                >
                  {comment.content}
                </Typography>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      {/* Comment input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: "auto",
          flexShrink: 0,
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{
            "& .MuiInputBase-input": {
              color: theme.text,
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.02)",
              "&:hover": {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
              },
              "& fieldset": {
                borderColor: theme.border,
              },
              "&:hover fieldset": {
                borderColor: theme.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.primary,
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: theme.text,
              opacity: 0.7,
            },
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                disabled={!newComment.trim()}
                sx={{
                  color: newComment.trim() ? theme.text : `${theme.text}70`,
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
}
