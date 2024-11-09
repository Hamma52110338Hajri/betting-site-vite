const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

let users = [];

// Mock data
users.push({ id: 1, username: 'user1' });
users.push({ id: 2, username: 'user2' });

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = { id: users.length + 1, username };
  users.push(newUser);
  res.json(newUser);
});

app.post('/api/transactions', (req, res) => {
  const { userId, amount } = req.body;
  // Logic to send money to the user
  console.log(`Sent ${amount} to user ${userId}`);
  res.json({ message: `Sent ${amount} to user ${userId}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
