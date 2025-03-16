import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);
const MotionListItem = motion(ListItem);

const Sidebar = ({
  currentView,
  onViewChange,
  theme,
  isExpanded,
  onToggleExpand,
}) => {
  const menuItems = [
    { id: "home", label: "Home", icon: <HomeIcon /> },
    { id: "completed", label: "Completed", icon: <CheckCircleIcon /> },
    { id: "deleted", label: "Deleted", icon: <DeleteIcon /> },
  ];

  const getItemColor = (itemId) => {
    switch (itemId) {
      case "home":
        return "#4CAF50"; // Green
      case "completed":
        return "#2196F3"; // Blue
      case "deleted":
        return "#F44336"; // Red
      default:
        return theme.text;
    }
  };

  return (
    <MotionBox
      animate={{ width: isExpanded ? "auto" : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      sx={{
        minHeight: "100vh",
        minWidth: isExpanded ? 190 : 72,
        maxWidth: isExpanded ? 200 : 72,
        bgcolor: theme.background === "#121212" ? "#1e1e1e" : "#ffffff",
        borderRight: `1px solid ${theme.border}`,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        overflow: "hidden",
      }}
    >
      <List sx={{ mt: 7 }}>
        <MotionListItem
          component="div"
          sx={{
            justifyContent: "center",
            mb: 0,
            cursor: "pointer",
            "&:hover": {
              bgcolor:
                theme.background === "#121212"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.04)",
            },
          }}
          onClick={onToggleExpand}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              sx={{
                color: theme.text,
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>
        </MotionListItem>

        {menuItems.map((item) => (
          <MotionListItem
            key={item.id}
            component="div"
            onClick={() => onViewChange(item.id)}
            selected={currentView === item.id}
            sx={{
              color: theme.text,
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s ease",
              pl: isExpanded ? 2 : "24px",
              height: isExpanded ? "auto" : "56px",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                backgroundColor: getItemColor(item.id),
                opacity: currentView === item.id ? 1 : 0,
                transition: "opacity 0.2s ease",
              },
              "&.Mui-selected": {
                bgcolor:
                  theme.background === "#121212"
                    ? `${getItemColor(item.id)}15`
                    : `${getItemColor(item.id)}10`,
                color: getItemColor(item.id),
              },
              "&:hover": {
                bgcolor:
                  theme.background === "#121212"
                    ? `${getItemColor(item.id)}15`
                    : `${getItemColor(item.id)}10`,
                "&::before": {
                  opacity: 0.7,
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                color:
                  currentView === item.id ? getItemColor(item.id) : theme.text,
                transition: "color 0.2s ease",
                minWidth: isExpanded ? 40 : "auto",
                mr: isExpanded ? 2 : 0,
                justifyContent: "center",
                height: isExpanded ? "auto" : "24px",
                "& .MuiSvgIcon-root": {
                  fontSize: isExpanded ? 24 : 22,
                },
              }}
            >
              {item.icon}
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
                    primary={item.label}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color:
                          currentView === item.id
                            ? getItemColor(item.id)
                            : theme.text,
                        fontWeight: currentView === item.id ? 500 : 400,
                        transition: "color 0.2s ease",
                      },
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </MotionListItem>
        ))}
      </List>
    </MotionBox>
  );
};

export default Sidebar;
