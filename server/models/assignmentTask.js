import * as autoIncrement from "mongoose-auto-increment";

import mongoose from "mongoose";

const Schema = mongoose.Schema;

const AssignmentTaskSchema = new Schema({
  title: { type: "String" },
  examType: { type: "String" },
  createdDate: { type: "String" },
  collectionDate: { type: "String" },
  assignmentDate: { type: "String" },
  examCenters: [{ type: Schema.Types.ObjectId }],
  examCenterData: [{ type: Schema.Types.ObjectId }],
  collectionStatus: [
    {
      status: { type: "String" },
      examCenter: { type: Schema.Types.ObjectId, ref: "ExamCenter" },
    },
  ],
  // collectionStatus: {
  //   type: "Map",
  //   of: { type: "String" },
  // },
  chiefInvigilatorComplete: { type: Boolean, required: true, default: false },
  viceChiefInvigilatorComplete: {
    type: Boolean,
    required: true,
    default: false,
  },
  invigilatorComplete: { type: Boolean, required: true, default: false },
  environmentalSupervisorComplete: {
    type: Boolean,
    required: true,
    default: false,
  },
  roomKeeperComplete: { type: Boolean, required: true, default: false },
  reservedInvigilatorComplete: {
    type: Boolean,
    required: true,
    default: false,
  },
  assignmentResults: [
    { type: mongoose.Types.ObjectId, ref: "AssignmentResult", default: [] },
  ],
  status: { type: String, required: true, default: "Collection in progress" },
  district: { type: String, required: true },
});

export default mongoose.model("AssignmentTask", AssignmentTaskSchema);
