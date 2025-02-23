import React from "react";
import { Switch } from "@mui/material";

const DarkModeToggle = ({ darkMode, toggleDarkMode }) => {
  return (
    <div>
      <Switch
        checked={darkMode}
        onChange={toggleDarkMode}
        color="primary"
        inputProps={{ "aria-label": "dark mode toggle" }}
      />
    </div>
  );
};

export default DarkModeToggle;
