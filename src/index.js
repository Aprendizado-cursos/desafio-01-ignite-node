const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found" });

  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.find((user) => user.username === username))
    return response.status(400).json({ error: "User already exists" });

  const user = { name, username, id: uuidv4(), todos: [] };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { deadline, title } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline).toISOString(),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  let todoToUpdate = request.user.todos.find(
    (todo) => todo.id === request.params.id
  );

  if (!todoToUpdate)
    return response.status(404).json({ error: "Todo not found" });

  let newTodo;
  request.user.todos = request.user.todos.map((todo) => {
    if (todo.id === request.params.id) {
      newTodo = { ...todo, title, deadline: new Date(deadline).toISOString() };
      return newTodo;
    }

    return todo;
  });

  return response.json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  let todoToUpdate = request.user.todos.find(
    (todo) => todo.id === request.params.id
  );

  if (!todoToUpdate)
    return response.status(404).json({ error: "Todo not found" });

  let newTodo;
  request.user.todos = request.user.todos.map((todo) => {
    if (todo.id === request.params.id) {
      newTodo = { ...todo, done: true };
      return newTodo;
    }

    return todo;
  });

  return response.json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  let todoToUpdate = request.user.todos.find(
    (todo) => todo.id === request.params.id
  );

  if (!todoToUpdate)
    return response.status(404).json({ error: "Todo not found" });

  request.user.todos = request.user.todos.filter((todo) => todo.id !== request.params.id);

  response.status(204).json({});
});

module.exports = app;
