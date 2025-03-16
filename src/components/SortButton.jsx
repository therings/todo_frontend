import { Button, Box, Menu, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

const SortButton = ({ sortOrder, sortBy, onSort, theme, currentView }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (newSortBy) => {
    onSort(newSortBy);
    handleClose();
  };

  const getSortLabel = () => {
    const order = sortOrder === "desc" ? "RECENT" : "OLDEST";

    switch (sortBy) {
      case "createdAt":
        return `${order} CREATED FIRST`;
      case "updatedAt":
        return `${order} UPDATED FIRST`;
      case "completedAt":
        return `${order} BY COMPLETED DATE`;
      case "deletedAt":
        return `${order} BY DELETED DATE`;
      default:
        return `${order} CREATED FIRST`;
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<SortIcon />}
        onClick={handleClick}
        sx={{
          color: theme.text,
          borderColor: theme.border,
          backgroundColor:
            theme.background === "#121212"
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.02)",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor:
              theme.background === "#121212"
                ? "rgba(255,255,255,0.5)"
                : "rgba(0,0,0,0.5)",
            backgroundColor:
              theme.background === "#121212"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            transform: "translateY(-1px)",
            boxShadow:
              theme.background === "#121212"
                ? "0 2px 8px rgba(255,255,255,0.1)"
                : "0 2px 8px rgba(0,0,0,0.1)",
          },
          "&:active": {
            transform: "translateY(0)",
            boxShadow: "none",
          },
        }}
      >
        {getSortLabel()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: theme.background,
              color: theme.text,
              boxShadow:
                theme.background === "#121212"
                  ? "0 2px 10px rgba(255,255,255,0.1)"
                  : "0 2px 10px rgba(0,0,0,0.1)",
              border: `1px solid ${theme.border}`,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleSort("createdAt")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minWidth: "200px",
            transition: "all 0.2s ease",
            position: "relative",
            "&:hover": {
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
            },
            ...(sortBy === "createdAt" && {
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.08)",
            }),
          }}
        >
          Sort by created date
          {sortBy === "createdAt" && <CheckIcon fontSize="small" />}
        </MenuItem>

        <MenuItem
          onClick={() => handleSort("updatedAt")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minWidth: "200px",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
            },
            ...(sortBy === "updatedAt" && {
              backgroundColor:
                theme.background === "#121212"
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(0,0,0,0.08)",
            }),
          }}
        >
          Sort by updated date
          {sortBy === "updatedAt" && <CheckIcon fontSize="small" />}
        </MenuItem>

        {currentView === "completed" && (
          <MenuItem
            onClick={() => handleSort("completedAt")}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: "200px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              },
              ...(sortBy === "completedAt" && {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.08)",
              }),
            }}
          >
            Sort by completed date
            {sortBy === "completedAt" && <CheckIcon fontSize="small" />}
          </MenuItem>
        )}

        {currentView === "deleted" && (
          <MenuItem
            onClick={() => handleSort("deletedAt")}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              minWidth: "200px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              },
              ...(sortBy === "deletedAt" && {
                backgroundColor:
                  theme.background === "#121212"
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.08)",
              }),
            }}
          >
            Sort by deleted date
            {sortBy === "deletedAt" && <CheckIcon fontSize="small" />}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default SortButton;
