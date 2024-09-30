const express = require('express');
const dotenv = require('dotenv');
require('./config/db');
const authRoutes = require('./routes/auth');
const competitorRoutes = require('./routes/competitor');
const liveRoutes = require('./routes/live');
const adminRoutes = require('./routes/admin');
const performanceData = require('./routes/performance');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const cors = require('cors');

dotenv.config();


const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// app.use(cors({
//   origin: 'https://your-frontend-domain.com',
//   optionsSuccessStatus: 200
// }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/competitor', competitorRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api" , performanceData)

// Create admin user if not exists
const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        number: '0000000000',
        password: adminPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch(err) {
    console.error('Error creating admin user:', err);
  }
};

createAdmin();

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
