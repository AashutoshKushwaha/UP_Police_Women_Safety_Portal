const Submission = require('../models/Submission');
const audit = require('../middleware/audit');
const User = require('../models/User');
const multerUpload = require('../middleware/upload');

// Handle driver data submission with file uploads
exports.submitData = [
  multerUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'aadhaarDoc', maxCount: 1 },
    { name: 'rcDoc', maxCount: 1 },
    { name: 'licenseDoc', maxCount: 1 },
    { name: 'insuranceDoc', maxCount: 1 },
    { name: 'pollutionDoc', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      // Strong validation (implement or call a helper, omitted for brevity)
      // We'll assume here all required validations passed on frontend and re-check basic here

      // Check if driver already has a submission (latest one used)
      let submission = await Submission.findOne({ driver: req.user._id }).sort({ createdAt: -1 });

      const formData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: req.body.dob,
        mobile: req.body.mobile,
        photo: req.files['photo'] ? req.files['photo'][0].filename : submission?.data.photo,
        aadhaarNum: req.body.aadhaarNum,
        aadhaarDoc: req.files['aadhaarDoc'] ? req.files['aadhaarDoc'][0].filename : submission?.data.aadhaarDoc,
        fatherName: req.body.fatherName,
        address: req.body.address,
        nearestStation: req.body.nearestStation,
        vehicleNum: req.body.vehicleNum,
        rcDoc: req.files['rcDoc'] ? req.files['rcDoc'][0].filename : submission?.data.rcDoc,
        licenseNum: req.body.licenseNum,
        licenseDoc: req.files['licenseDoc'] ? req.files['licenseDoc'][0].filename : submission?.data.licenseDoc,
        insuranceNum: req.body.insuranceNum,
        insuranceDoc: req.files['insuranceDoc'] ? req.files['insuranceDoc'][0].filename : submission?.data.insuranceDoc,
        routeStart: req.body.routeStart,
        routeEnd: req.body.routeEnd,
        pollutionDoc: req.files['pollutionDoc'] ? req.files['pollutionDoc'][0].filename : submission?.data.pollutionDoc,
        crimeHistory: {
          hasRecord: req.body.crimeHistory === 'yes',
          details: req.body.crimeDetails || ''
        }
      };

      if (submission && submission.adminFinalStatus !== 'verified') {
        // Update previous submission if not verified yet
        submission.data = formData;
        submission.status = 'pending';
        submission.adminFinalStatus = 'pending';
        submission.station = null;
        submission.qrCodePath = '';
        submission.auditTrail.push({
          action: 'updated_submission',
          by: req.user.username,
          at: new Date(),
          details: 'Driver re-submitted form after rejection or initial submission.'
        });
        await submission.save();
      } else if (!submission) {
        submission = new Submission({
          driver: req.user._id,
          data: formData
        });
        submission.auditTrail.push({
          action: 'submitted',
          by: req.user.username,
          at: new Date(),
          details: 'Driver submitted new form.'
        });
        await submission.save();
      } else {
        // Already verified, can't resubmit
        return res.status(400).json({ message: 'Submission already verified, cannot update.' });
      }

      await audit(submission._id, 'Driver submission', req.user._id, 'Driver submitted or updated data');

      return res.json({ message: 'Submission saved', submission });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
];

// Retrieve driver's latest submission and verify status + qr code path
exports.getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ driver: req.user._id }).sort({ createdAt: -1 }).lean();
    if (!submission) return res.status(404).json({ message: 'No submission found' });
    res.json({
      data: submission.data,
      status: submission.adminFinalStatus,
      qrCodePath: submission.qrCodePath || null,
      adminReason: submission.adminReason || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Return the QR code image/file (if any) for the driver submission id
exports.getQr = async (req, res) => {
  const submissionId = req.params.id;
  try {
    const submission = await Submission.findOne({ _id: submissionId, driver: req.user._id });
    if (!submission || !submission.qrCodePath) return res.status(404).json({ message: 'QR code not found' });

    // send QR code file from disk
    return res.sendFile(require('path').resolve(submission.qrCodePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get driver details by submission ID (public-facing data)
exports.getDriverDetailsBySubmissionId = async (req, res) => {
  // Log 1: When a request hits this function
  // This will appear in your backend terminal if the request successfully reaches your server.
  console.log(`[Backend Log] Request received for /details/${req.params.submissionId}`);

  try {
    const submissionId = req.params.submissionId;

    // Log 2: Before querying the database
    // Shows the exact ID your backend is attempting to use for the database lookup.
    console.log(`[Backend Log] Searching MongoDB for submission with ID: ${submissionId}`);

    const submission = await Submission.findById(submissionId).lean(); // Use .lean() for performance when not modifying

    // Log 3: After querying the database
    if (submission) {
      console.log(`[Backend Log] Submission FOUND for ID: ${submissionId}`);
    } else {
      console.log(`[Backend Log] Submission NOT FOUND for ID: ${submissionId}. Sending 404.`);
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Extract only the public-facing data you want to display on the app.
    const publicData = {
      firstName: submission.data.firstName,
      lastName: submission.data.lastName,
      mobile: submission.data.mobile,
      vehicleNum: submission.data.vehicleNum,
      // Add more fields from submission.data as needed
    };

    // Log 4: Before sending a successful response
    console.log(`[Backend Log] Successfully extracted public data for ID: ${submissionId}. Sending 200.`);
    return res.json(publicData);

  } catch (err) {
    // Log 5: If any unexpected error occurs within the try block (e.g., Mongoose error, database down, malformed ID)
    console.error(`[Backend Log] ERROR processing request for ID ${req.params.submissionId}:`, err);
    return res.status(500).json({ message: 'Server error' });
  }
};

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