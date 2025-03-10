import Box from "@mui/material/Box";
import TodoItem from "./TodoItem";

import PropTypes from "prop-types";

const TodoList = ({
  todos = [],
  onToggle,
  onDelete,
  onUpdate,
  onRestore,
  theme,
  columns,
  onCardClick,
  isDeletedView,
}) => {
  // Add console.log to debug
  console.log("Received todos:", todos);

  const todoArray = Array.isArray(todos) ? todos : [];
  console.log("Processed todoArray:", todoArray);

  return (
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
      {todoArray.map((todo) => (
        <Box key={todo.id} onClick={() => onCardClick(todo)}>
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onRestore={onRestore}
            theme={theme}
            isDeletedView={isDeletedView}
          />
        </Box>
      ))}
    </Box>
  );
};

TodoList.propTypes = {
  // Add todos validation
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      // Add other todo properties as needed
    })
  ),
  onToggle: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onRestore: PropTypes.func,
  theme: PropTypes.shape({
    background: PropTypes.string,
    text: PropTypes.string,
    border: PropTypes.string,
  }).isRequired,
  onCardClick: PropTypes.func.isRequired,
  columns: PropTypes.number.isRequired,
  isDeletedView: PropTypes.bool,
};

export default TodoList;
