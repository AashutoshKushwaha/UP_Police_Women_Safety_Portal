const Submission = require('../models/Submission');
const audit = require('../middleware/audit');
const User = require('../models/User');

// Receive scanned QR payload, fetch submission data securely (authenticated)
exports.scanQrAndFetchDriverData = async (req, res) => {
  try {
    const { submissionId } = req.body;
    if (!submissionId) return res.status(400).json({ message: 'Submission ID required' });

    const submission = await Submission.findById(submissionId).populate('driver', 'username').lean();
    if (!submission) return res.status(404).json({ message: 'No submission found' });
    if (submission.adminFinalStatus !== 'verified') {
      return res.status(403).json({ message: 'Data not verified' });
    }

    // Audit officer view
    await audit(submission._id, 'officer_view', req.user._id, `Officer viewed submission`);

    res.json({
      driverUsername: submission.driver.username,
      data: submission.data,
      status: submission.adminFinalStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get audit trail by submission (accessible to officer/admin)
exports.getAuditTrail = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const Audit = require('../models/Audit');
    const trail = await Audit.find({ submission: submissionId }).populate('byUser', 'username role').sort({ at: 1 });
    res.json(trail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
