import React, { useState } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const addUser = () => {
    if (!newUser) {
      alert('Please enter a username');
      return;
    }

    const userExists = users.some(user => user.username.toLowerCase() === newUser.toLowerCase());
    if (userExists) {
      alert('User already exists');
      return;
    }

    const userToAdd = {
      id: Date.now(),
      username: newUser,
      balance: 0,
      amountToSend: 0,
      amountToWithdraw: 0
    };

    setUsers([...users, userToAdd]);
    setNewUser('');
  };

  const handleSendMoney = (userId, amount) => {
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, balance: user.balance + amount, amountToSend: 0 } : user
    );

    setUsers(updatedUsers);
  };

  const handleWithdrawMoney = (userId, amount) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        if (user.balance < amount) {
          alert('Insufficient balance');
          return user;
        }
        return { ...user, balance: user.balance - amount, amountToWithdraw: 0 };
      }
      return user;
    });

    setUsers(updatedUsers);
  };

  const removeUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="search-form">
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="user-creation-form">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          placeholder="Username"
        />
        <button onClick={addUser}>Add User</button>
      </div>

      <div className="users-list">
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td> {user.balance.toFixed(2)} د.ت </td>
                <td>
                  <div className="action-inputs">
                    <div className="input-group">
                      <input
                        type="number"
                        value={user.amountToSend || ''}
                        onChange={(e) =>
                          setUsers(users.map(u => 
                            u.id === user.id ? { ...u, amountToSend: parseFloat(e.target.value) || 0 } : u
                          ))
                        }
                        placeholder="Send Amount"
                        min="0"
                      />
                      <button onClick={() => handleSendMoney(user.id, user.amountToSend)}>Send</button>
                    </div>

                    <div className="input-group">
                      <input
                        type="number"
                        value={user.amountToWithdraw || ''}
                        onChange={(e) =>
                          setUsers(users.map(u => 
                            u.id === user.id ? { ...u, amountToWithdraw: parseFloat(e.target.value) || 0 } : u
                          ))
                        }
                        placeholder="Withdraw Amount"
                        min="0"
                      />
                      <button onClick={() => handleWithdrawMoney(user.id, user.amountToWithdraw)}>Withdraw</button>
                    </div>

                    <button 
                      onClick={() => removeUser(user.id)} 
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
