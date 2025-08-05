const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    default: 'General',
  },
  studentName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  issuedDate: {
    type: Date,
    required: true,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
