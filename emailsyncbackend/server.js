const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
dotenv.config();
const app = express();

app.use(cors());
app.use('/emailsync/auth', authRoutes);
app.use('/emailsync/user', userRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(8015, () => console.log('Server running on http://127.0.0.1:8015'));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
