import React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion, AnimatePresence } from "framer-motion";

const MotionListItem = motion(ListItem);
const MotionIcon = motion.div;

const DarkModeToggle = ({ darkMode, toggleDarkMode, theme, isExpanded }) => {
  return (
    <MotionListItem
      component="div"
      onClick={toggleDarkMode}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        color: theme.text,
        cursor: "pointer",
        justifyContent: "flex-start",
        pl: isExpanded ? 2 : "24px",
        py: 2,
        "&:hover": {
          bgcolor:
            theme.background === "#121212"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.04)",
        },
      }}
    >
      <ListItemIcon
        sx={{
          color: theme.text,
          minWidth: isExpanded ? 40 : "auto",
          mr: isExpanded ? 2 : 0,
          justifyContent: "center",
        }}
      >
        <MotionIcon
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformOrigin: "center",
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: darkMode ? 360 : 0 }}
          transition={{
            duration: 0.6,
            ease: [0.4, 0.0, 0.2, 1],
          }}
        >
          {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
        </MotionIcon>
      </ListItemIcon>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
          >
            <ListItemText
              primary={darkMode ? "Dark Mode" : "Light Mode"}
              sx={{
                "& .MuiListItemText-primary": {
                  color: theme.text,
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionListItem>
  );
};

export default DarkModeToggle;
