import {
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  theme,
  isZoomed,
}) {
  if (!todo) return null;

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
          <Typography
            sx={{
              flex: 1,
              ml: 1,
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
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(todo.id);
            }}
            sx={{
              color: theme.text,
              marginLeft: "auto",
              alignSelf: "flex-end",
              mt: "auto",
              mr: -1,
            }}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}
