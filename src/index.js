const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const error = {error: 'Mensagem do erro'}

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user=>user.username === username)
  if(!user){
    return response.status(404).json(error)
  }
  request.user = user
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user=>user.username === username)
  if(userAlreadyExists)
    return response.status(400).json(error)
  const user = { name, username, id: uuid(), todos: [] }
  users.push(user)
  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user
  response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body
  const todo = { id: uuid(), title, done: false, deadline: new Date(deadline), created_at: new Date()}
  user.todos.push(todo)
  response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const user = request.user;
  const todo = user.todos.find(todo=>todo.id === id)
  if(!todo){
    return response.status(404).json(error);
  }
  todo.title = title;
  todo.deadline = new Date(deadline)
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todo = user.todos.find(todo=>todo.id === id)
  if(!todo){
    return response.status(404).json(error);
  }
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const user = request.user;
  const todoIndex = user.todos.findIndex(todo=>todo.id === id)
  if(todoIndex < 0){
    return response.status(404).json(error);
  }
  user.todos = user.todos.filter((_, index)=> index !== todoIndex)
  return response.status(204).json();
});

module.exports = app;