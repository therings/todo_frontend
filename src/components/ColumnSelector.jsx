import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

const ColumnSelector = ({ columns, onChange, theme }) => (
  <ToggleButtonGroup
    value={columns}
    exclusive
    onChange={(e, newVal) => {
      if (newVal !== null) {
        onChange(newVal);
      }
    }}
    sx={{
      mb: 2,
      "& .MuiToggleButton-root": {
        color: theme.text,
        borderColor: theme.border,
        "&:hover": {
          backgroundColor:
            theme.background === "#121212"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
        },
        "&.Mui-selected": {
          backgroundColor:
            theme.background === "#121212"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.1)",
        },
      },
    }}
  >
    {[2, 3, 4].map((num) => (
      <ToggleButton value={num} key={num}>
        <ViewColumnIcon sx={{ mr: 1 }} />
        {num}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

export default ColumnSelector;
