const Audit = require('../models/Audit');
module.exports = async (submissionId, action, userId, details = '') => {
    await Audit.create({ submission: submissionId, action, byUser: userId, details });
};
