const Submission = require("../models/Submission");
const audit = require("../middleware/audit");

exports.getAssignments = async (req, res) => {
  try {
    // Fetch assigned submissions still pending station approval
    const submissions = await Submission.find({
      station: req.user._id,
      status: "pending",
    })
      .populate("driver", "username")
      .lean();
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, reason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (submission.station.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "verified") {
      submission.status = "under_verification"; // Mark for admin review
      submission.stationVerified = true;
      submission.stationRejectedReason = "";
    } else if (status === "rejected") {
      submission.status = "rejected";
      submission.stationVerified = false;
      submission.stationRejectedReason = reason || "Rejected by station";
    }

    await submission.save();

    await audit(
      submission._id,
      `station_${status}`,
      req.user._id,
      status === "rejected" ? `Rejected: ${reason}` : "Verified by station"
    );

    res.json({ message: `Submission ${status} by station`, submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    // Fetch submissions that are not pending for this station
    const submissions = await Submission.find({
      station: req.user._id,
      status: { $in: ["under_verification", "verified", "rejected"] },
    })
      .populate("driver", "username")
      .lean();
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
