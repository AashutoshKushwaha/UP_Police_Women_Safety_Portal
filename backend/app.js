require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const officerRoutes = require('./routes/officerRoutes');
const stationRoutes = require('./routes/stationRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static file serving (for uploads: images, PDFs, QR codes)
app.use('/uploads', express.static('uploads'));

// Role-based API routes
app.use('/api/users', userRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/station', stationRoutes);

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`API running on port ${PORT}`)))
  .catch(err => console.log('MongoDB Error:', err));
//Aashutosh Kushwaha ,IIT KANPUR