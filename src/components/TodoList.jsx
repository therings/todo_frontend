import Box from "@mui/material/Box";
import TodoItem from "./TodoItem";

import PropTypes from "prop-types";

const TodoList = ({
  todos,
  onToggle,
  onDelete,
  theme,
  columns,
  onCardClick,
}) => (
  <Box
    sx={{
      mt: 2,
      padding: 2,
      display: "grid",
      gap: 2,
      gridTemplateColumns: {
        xs: "1fr",
        sm: `repeat(${columns}, 1fr)`,
      },
    }}
  >
    {todos.map((todo) => (
      <Box key={todo.id} onClick={() => onCardClick(todo)}>
        <TodoItem
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          theme={theme}
        />
      </Box>
    ))}
  </Box>
);

TodoList.propTypes = {
  theme: PropTypes.shape({
    background: PropTypes.string,
    text: PropTypes.string,
    border: PropTypes.string,
  }).isRequired,
  onCardClick: PropTypes.func.isRequired,
  columns: PropTypes.number.isRequired,
};

export default TodoList;
