const mongoose = require("mongoose");

const progressItemSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "attempted", "solved"],
      default: "not_started",
    },
    lastSubmittedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    progress: {
      type: [progressItemSchema],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
