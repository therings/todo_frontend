import { Button, Box, Menu, MenuItem } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

const SortButton = ({ sortOrder, sortBy, onSort, theme }) => {
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
    if (sortBy === "createdAt") {
      return sortOrder === "desc"
        ? "RECENT CREATED FIRST"
        : "OLDEST CREATED FIRST";
    } else {
      return sortOrder === "desc"
        ? "RECENT UPDATED FIRST"
        : "OLDEST UPDATED FIRST";
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
          "&:hover": {
            borderColor: theme.text,
            backgroundColor: "rgba(128, 128, 128, 0.1)",
          },
        }}
      >
        {getSortLabel()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: theme.background,
            color: theme.text,
          },
        }}
      >
        <MenuItem
          onClick={() => handleSort("createdAt")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minWidth: "200px",
          }}
        >
          {sortOrder === "desc"
            ? "RECENT CREATED FIRST"
            : "OLDEST CREATED FIRST"}
          {sortBy === "createdAt" && <CheckIcon fontSize="small" />}
        </MenuItem>
        <MenuItem
          onClick={() => handleSort("updatedAt")}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minWidth: "200px",
          }}
        >
          {sortOrder === "desc"
            ? "RECENT UPDATED FIRST"
            : "OLDEST UPDATED FIRST"}
          {sortBy === "updatedAt" && <CheckIcon fontSize="small" />}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SortButton;
