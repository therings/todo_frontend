import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

const Sidebar = ({ currentView, onViewChange, theme }) => {
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
    <Box
      sx={{
        width: 240,
        minHeight: "100vh",
        bgcolor: theme.background === "#121212" ? "#1e1e1e" : "#f5f5f5",
        borderRight: `1px solid ${theme.border}`,
        position: "fixed",
        left: 0,
        top: 0,
        pt: 8, // Add padding top to account for AppBar
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            component="div"
            onClick={() => onViewChange(item.id)}
            selected={currentView === item.id}
            sx={{
              color: theme.text,
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s ease",
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
              }}
            >
              {item.icon}
            </ListItemIcon>
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
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
