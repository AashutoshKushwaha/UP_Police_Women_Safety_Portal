const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: {
    firstName: String,
    lastName: String,
    dob: String,
    mobile: String,
    photo: String,
    aadhaarNum: String,
    aadhaarDoc: String,
    fatherName: String,
    address: String,
    nearestStation: String,
    vehicleNum: String,
    rcDoc: String,
    licenseNum: String,
    licenseDoc: String,
    insuranceNum: String,
    insuranceDoc: String,
    routeStart: String,
    routeEnd: String,
    pollutionDoc: String,
    crimeHistory: {
      hasRecord: Boolean,
      details: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'under_verification', 'verified', 'rejected'],
    default: 'pending'
  },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stationVerified: { type: Boolean, default: false },          // Flag for station verification
  stationRejectedReason: { type: String, default: '' },        // Rejection reason given by the station

  adminFinalStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  adminReason: String,                                         // Admin rejection reason
  qrCodePath: String,                                          // QR code filename
  auditTrail: [{ action: String, by: String, at: Date, details: String }]
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
