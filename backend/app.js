require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authroutes');
const ticketRoutes = require('./routes/ticketRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const dashboardRoutes = require('./routes/dashboard');
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'Helpdesk API is running' });
});
app.get('/api/health', (req, res) => {
  res.json({ message: 'Helpdesk API is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
