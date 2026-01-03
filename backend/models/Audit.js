const mongoose = require('mongoose');
const auditSchema = new mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    action: String,
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // police/admin
    at: { type: Date, default: Date.now },
    details: String
});
module.exports = mongoose.model('Audit', auditSchema);
