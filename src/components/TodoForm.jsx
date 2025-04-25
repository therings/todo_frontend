import { useState } from "react";
import { TextField, Stack, IconButton, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";

export default function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title);
      setTitle("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Write a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    color="primary"
                    type="submit"
                    aria-label="add todo"
                  >
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                color: theme.text,
                opacity: 0.6,
              },
              "& .MuiOutlinedInput-root": {
                color: theme.text,
                backgroundColor:
                  theme.background === "#1a1a1a" ? "#333" : "#f5f5f5",
                "&:hover": {
                  backgroundColor:
                    theme.background === "#1a1a1a" ? "#404040" : "#ebebeb",
                },
                "& fieldset": {
                  borderColor: theme.border,
                },
                "&:hover fieldset": {
                  borderColor: theme.background === "#1a1a1a" ? "#666" : "#ccc",
                },
              },
            }}
          />
        </Stack>
      </form>
    </div>
  );
}
