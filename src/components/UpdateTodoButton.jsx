import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function UpdateTodoButton({
  theme,
  onStartEdit,
  isEditing,
  onSave,
  color,
}) {
  const handleClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (isEditing) {
      onSave();
    } else {
      onStartEdit();
    }
  };

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        color: color || theme.text,
        "&:hover": {
          backgroundColor: color ? `${color}15` : undefined,
        },
      }}
    >
      {isEditing ? <SaveIcon /> : <EditIcon />}
    </IconButton>
  );
}
