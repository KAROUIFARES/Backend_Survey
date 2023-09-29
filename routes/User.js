const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises; // Import fs.promises for async file operations
const path = require('path');
const jwt = require('jsonwebtoken'); // Import jwt if not already imported

const app = express.Router();
const usersFilePath = './Data/user.json';
const secretKey = 'yourSecretKey'; // Replace with your actual secret key

app.use(express.json());

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }
  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    req.user = user;
    next();
  });
}

function getUsersFromJson() {
  const data = fs.readFileSync(usersFilePath, 'utf-8'); // Read file synchronously
  return JSON.parse(data);
}

function writeUsersToJson(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsersFromJson();

  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secretKey);
  res.json({ token });
});

app.post('/SignUp', (req, res) => {
    const { username, email, password } = req.body;
    const users = getUsersFromJson();
      if (users.some((user) => user.username === username)) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    const newUser = {
      id: Date.now(),
      username,
      email,
      password, 
    };
    users.push(newUser);
    writeUsersToJson(users);
    res.json({ message: 'User registered successfully' });
  });
  

app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'You have accessed the protected route!', user: req.user });
});

module.exports = app;
