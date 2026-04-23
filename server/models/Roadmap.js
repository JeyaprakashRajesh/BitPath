const mongoose = require("mongoose");

const roadmapItemSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    items: {
      type: [roadmapItemSchema],
      default: [],
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
