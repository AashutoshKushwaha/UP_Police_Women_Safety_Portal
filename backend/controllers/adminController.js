const User = require('../models/User');
const Submission = require('../models/Submission');
const audit = require('../middleware/audit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { JWT_SECRET, UPLOAD_PATH } = process.env;

// Create Police Station or Officer accounts (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!['station', 'officer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "station" or "officer".' });
    }
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existingUser = await User.findOne({ username: username.toUpperCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username.toUpperCase(),
      password: hashedPassword,
      role,
      createdBy: req.user.username,
      lockedUntil: null,
      loginAttempts: 0,
    });

    await newUser.save();

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully.`,
      user: {
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error during user creation.' });
  }
};

// List all police stations and officers
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['station', 'officer'] } }, 'username role createdAt');
    res.json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

// Get all submissions for admin dashboard
exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('driver', 'username')
      .populate('station', 'username')
      .lean();
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error fetching submissions.' });
  }
};

// Assign submission to a police station
exports.assignToStation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { stationId } = req.body;

    if (!stationId) {
      return res.status(400).json({ message: 'Station ID is required.' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    const station = await User.findOne({ _id: stationId, role: 'station' });
    if (!station) {
      return res.status(404).json({ message: 'Station not found or invalid.' });
    }

    submission.station = station._id;
    submission.status = 'pending'; // Correctly set to pending

    await submission.save();

    await audit(submission._id, 'assigned_to_station', req.user._id, `Assigned to station ${station.username}`);

    res.json({ message: 'Submission successfully assigned to station.', submission });
  } catch (error) {
    console.error('Error assigning submission:', error);
    res.status(500).json({ message: 'Server error assigning submission.' });
  }
};

// Handle admin final verify/reject with QR code generation
exports.handleVerification = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { finalStatus, reason } = req.body;

    if (!['verified', 'rejected'].includes(finalStatus)) {
      return res.status(400).json({ message: 'Invalid finalStatus value.' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    if (submission.adminFinalStatus === 'verified') {
      return res.status(400).json({ message: 'Submission already verified.' });
    }

    submission.adminFinalStatus = finalStatus;
    submission.adminReason = finalStatus === 'rejected' ? reason : '';

    if (finalStatus === 'verified') {
      const qrPayload = submission._id.toString();
      const qrFileName = `qr-${submission._id}.png`;
      const qrFilePath = path.join(UPLOAD_PATH || 'uploads', qrFileName);

      await QRCode.toFile(qrFilePath, qrPayload);

      submission.qrCodePath = qrFileName;
      submission.status = 'verified';
    } else {
      submission.qrCodePath = '';
      submission.status = 'rejected';
    }

    await submission.save();

    await audit(
      submission._id,
      `admin_${finalStatus}`,
      req.user._id,
      finalStatus === 'verified' ? 'Final verification' : `Rejected: ${reason}`
    );

    res.json({ message: `Submission ${finalStatus}`, submission });
  } catch (error) {
    console.error('Error handling admin verification:', error);
    res.status(500).json({ message: 'Server error during verification.' });
  }
};
exports.searchDrivers = async (req, res) => {
  try {
    const { firstName, fatherName, mobile, aadhaarNum } = req.query;
    const filter = {};
    if (firstName) filter['data.firstName'] = new RegExp('^' + firstName.trim(), 'i');
    if (fatherName) filter['data.fatherName'] = new RegExp('^' + fatherName.trim(), 'i');
    if (mobile) filter['data.mobile'] = mobile.trim();
    if (aadhaarNum) filter['data.aadhaarNum'] = aadhaarNum.trim();

    // Group by driver, only latest per driver
    const submissions = await Submission.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$driver",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    // Flatten for table UX
    res.json(submissions.map(s => ({
      _id: s._id,
      driver: s.driver,
      firstName: s.data?.firstName,
      lastName: s.data?.lastName,
      mobile: s.data?.mobile,
      aadhaarNum: s.data?.aadhaarNum,
      fatherName: s.data?.fatherName
    })));
  } catch (err) {
    res.status(500).json({ message: 'Error searching drivers' });
  }
};

// Driver details (latest submission)
// GET /admin/driver-details/:driverId
exports.getDriverDetails = async (req, res) => {
  try {
    const { driverId } = req.params;
    const submission = await Submission.findOne({ driver: driverId }).sort({ createdAt: -1 }).lean();
    if (!submission) return res.status(404).json({ message: "Not found" });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching driver details' });
  }
};