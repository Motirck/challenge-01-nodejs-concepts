const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middelware
function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const userFound = users.find((item) => item.username === username);

  if (!userFound) {
    return res.status(404).json({ error: 'User not found' })
  }

  req.user = userFound;

  return next();
}

//Middelware
function checksExistsUserTodo(req, res, next) {
  const { user } = req;
  const { id } = req.params;

  const todoFound = user.todos.some(
    (todo) => todo.id === id
  );

  if (!todoFound) {
    return res.status(404).json({ error: 'Todo not found' });
  };

  return next();
}

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return res.status(400).json({ error: 'User already exists.' });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  res.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { title, deadline } = req.body;

  let todoUpdated;
  user.todos.find((item) => {
    if (item.id === id) {
      item.title = title;
      item.deadline = deadline;
      todoUpdated = item;
    }
  });

  return res.json(todoUpdated);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsUserTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  let todoUpdated;
  user.todos.find((item) => {
    if (item.id === id) {
      item.done = true;
      todoUpdated = item;
    }
  });

  return res.json(todoUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsUserTodo, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.findIndex((item) => item.id === id);

  user.todos.splice(todo, 1)

  return res.status(204).send();
});

module.exports = app;