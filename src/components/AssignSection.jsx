import {
  Box,
  IconButton,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";

// Use the same API URL as the main app
const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

AssignSection.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    owner: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
  }).isRequired,
  onAssign: PropTypes.func,
  onUnassign: PropTypes.func,
  assignedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    })
  ),
  theme: PropTypes.shape({
    background: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    textSecondary: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
  }).isRequired,
  isCompact: PropTypes.bool,
};

export default function AssignSection({
  todo,
  assignedUsers = [],
  onAssign,
  onUnassign,
  theme,
  isCompact = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [error, setError] = useState(null);
  const open = Boolean(anchorEl);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser.id;

  // Check if current user is the todo owner
  const isOwner = String(todo.owner?.id) === String(currentUserId);

  // Check if the current user is assigned to this todo
  const isAssignedToMe = assignedUsers.some(
    (user) => String(user.id) === String(currentUserId)
  );

  // User can assign/unassign if they are the owner OR assigned to the todo
  const hasAssignPermission = isOwner || isAssignedToMe;

  // Add debug logging
  useEffect(() => {
    console.log("AssignSection Debug:", {
      storedUser,
      currentUserId: String(currentUserId),
      todoOwnerId: String(todo.owner?.id),
      isOwner,
      isAssignedToMe,
      hasAssignPermission,
      todo,
      rawCurrentUserId: currentUserId,
      rawTodoOwnerId: todo.owner?.id,
      typeof_currentUserId: typeof currentUserId,
      typeof_todoOwnerId: typeof todo.owner?.id,
    });
  }, [
    todo,
    isOwner,
    isAssignedToMe,
    hasAssignPermission,
    currentUserId,
    storedUser,
  ]);

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication required");
        return;
      }

      // Get all registered users
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      console.log("Users response:", response.data); // Debug log
      setAvailableUsers(response.data);
      setError(null);
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error - Cannot connect to server:", API_URL);
        setError("Cannot connect to server. Please check your connection.");
      } else if (error.response?.status === 404) {
        console.error("API endpoint not found:", error.config?.url);
        setError("User service unavailable");
      } else if (error.response?.status === 401) {
        console.error("Authentication failed");
        setError("Please log in again");
        // Optionally redirect to login or handle token refresh
      } else {
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Failed to load users";
        console.error("Failed to fetch users:", {
          status: error.response?.status,
          message: errorMessage,
          error: error,
        });
        setError(errorMessage);
      }
      setAvailableUsers([]);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    fetchAvailableUsers();
  };

  const handleClose = (event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setAnchorEl(null);
  };

  const handleAssign = async (userId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    try {
      console.log("handleAssign called with:", { todoId: todo.id, userId });
      console.log("onAssign type:", typeof onAssign);
      console.log("todo:", todo);

      if (typeof onAssign !== "function") {
        console.warn("onAssign is not a function");
        return;
      }
      await onAssign(todo.id, userId);
      handleClose();
    } catch (error) {
      console.error("Failed to assign user:", error);
    }
  };

  const handleUnassign = async (userId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    try {
      if (typeof onUnassign !== "function") {
        console.warn("onUnassign is not a function");
        return;
      }
      await onUnassign(todo.id, userId);
    } catch (error) {
      console.error("Failed to unassign user:", error);
    }
  };

  const isUserAssigned = (userId) => {
    return assignedUsers.some((user) => user.id === userId);
  };

  if (isCompact) {
    // Compact view with pill/capsule chips
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 0.8,
        }}
      >
        {assignedUsers.length > 0 &&
          assignedUsers.map((user) => (
            <Chip
              key={user.id}
              avatar={<Avatar src={user.avatar} alt={user.name} />}
              label={user.name}
              size="small"
              onDelete={
                hasAssignPermission && user.id !== todo.owner.id
                  ? (event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      handleUnassign(user.id, event);
                    }
                  : undefined
              }
              sx={{
                height: "28px",
                "& .MuiChip-label": {
                  fontSize: "0.8rem",
                  padding: "0 8px",
                },
                "& .MuiChip-avatar": {
                  width: 22,
                  height: 22,
                },
                "& .MuiChip-deleteIcon": {
                  fontSize: "0.9rem",
                  margin: "0 4px 0 -4px",
                  width: 18,
                  height: 18,
                },
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)",
                color: theme.text,
              }}
            />
          ))}
        {hasAssignPermission && (
          <IconButton
            size="small"
            onClick={handleClick}
            sx={{
              color: theme.text,
              padding: 0.5,
              height: 28,
              width: 28,
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            <PersonAddIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        )}
        <Menu
          id="assign-menu-compact"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            sx: {
              backgroundColor: theme.background,
              color: theme.text,
              padding: "4px",
              "& .MuiMenuItem-root": {
                minHeight: "40px",
                fontSize: "0.95rem",
              },
            },
          }}
        >
          {error && (
            <MenuItem disabled>
              <Typography
                variant="caption"
                sx={{
                  color: "#f44336",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                }}
              >
                Error loading users
              </Typography>
            </MenuItem>
          )}
          {!error &&
            availableUsers
              .filter(
                (user) =>
                  !isUserAssigned(user.id) &&
                  String(user.id) !== String(currentUserId)
              )
              .map((user) => (
                <MenuItem
                  key={user.id}
                  onClick={(event) => handleAssign(user.id, event)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 28, height: 28, fontSize: "0.9rem" }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                    {user.name}
                  </Typography>
                </MenuItem>
              ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        p: 1,
        borderRadius: 1,
        backgroundColor:
          theme.background === "#121212"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)",
      }}
    >
      {/* Created by section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: theme.text }}>
          Created by:
        </Typography>
        {todo.owner ? (
          <>
            <Tooltip title={todo.owner.name} arrow>
              <Avatar
                src={todo.owner.avatar}
                alt={todo.owner.name}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor:
                    theme.background === "#121212"
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                }}
              />
            </Tooltip>
            <Typography
              variant="body2"
              sx={{
                color: theme.text,
                flexGrow: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {todo.owner.name}
            </Typography>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: theme.text,
              fontStyle: "italic",
              flexGrow: 1,
            }}
          >
            Unknown
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: theme.border }} />

      {/* Assigned to section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.8,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: theme.text, fontSize: "0.85rem" }}
          >
            Assigned:
          </Typography>
          {hasAssignPermission && (
            <IconButton
              size="small"
              onClick={handleClick}
              sx={{
                color: theme.text,
                padding: 0.5,
                height: 28,
                width: 28,
                "&:hover": { opacity: 0.8 },
              }}
            >
              <PersonAddIcon sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          )}
        </Box>

        {/* Users list - pill/capsule chips */}
        {assignedUsers.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.8,
            }}
          >
            {assignedUsers.map((user) => (
              <Chip
                key={user.id}
                avatar={
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    sx={{ width: 24, height: 24 }}
                  />
                }
                label={user.name}
                size="small"
                onDelete={
                  hasAssignPermission && user.id !== todo.owner.id
                    ? (event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        handleUnassign(user.id, event);
                      }
                    : undefined
                }
                sx={{
                  height: "28px",
                  "& .MuiChip-label": {
                    fontSize: "0.8rem",
                    padding: "0 8px",
                  },
                  "& .MuiChip-avatar": {
                    width: 24,
                    height: 24,
                  },
                  "& .MuiChip-deleteIcon": {
                    fontSize: "0.9rem",
                    margin: "0 4px 0 -4px",
                    width: 18,
                    height: 18,
                  },
                  backgroundColor:
                    theme.background === "#121212"
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.08)",
                  color: theme.text,
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: theme.text,
              fontStyle: "italic",
              opacity: 0.8,
              fontSize: "0.8rem",
            }}
          >
            None
          </Typography>
        )}
      </Box>

      <Menu
        id="assign-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          sx: {
            backgroundColor: theme.background,
            color: theme.text,
            padding: "4px",
            "& .MuiMenuItem-root": {
              minHeight: "40px",
              fontSize: "0.95rem",
            },
          },
        }}
      >
        {error && (
          <MenuItem disabled>
            <Typography
              variant="body2"
              sx={{
                color: "#f44336",
                fontStyle: "italic",
                fontSize: "0.85rem",
              }}
            >
              Error loading users
            </Typography>
          </MenuItem>
        )}
        {!error &&
          availableUsers
            .filter(
              (user) =>
                !isUserAssigned(user.id) &&
                String(user.id) !== String(currentUserId)
            )
            .map((user) => (
              <MenuItem
                key={user.id}
                onClick={(event) => handleAssign(user.id, event)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 28, height: 28, fontSize: "0.9rem" }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                  {user.name}
                </Typography>
              </MenuItem>
            ))}
      </Menu>
    </Box>
  );
}
