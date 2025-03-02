import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function UpdateTodoButton({
  theme,
  onStartEdit,
  isEditing,
  onSave,
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
        color: theme.text,
      }}
    >
      {isEditing ? <SaveIcon /> : <EditIcon />}
    </IconButton>
  );
}
