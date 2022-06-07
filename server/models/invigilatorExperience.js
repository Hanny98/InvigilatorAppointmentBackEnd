import mongoose from "mongoose";

const Schema = mongoose.Schema;

const InvigilatorExperienceSchema = new Schema({
  role: { type: "String" },
  assignmentTask: { type: Schema.Types.ObjectId, ref: "AssignmentTask" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "ExamCenter" },
});

export default mongoose.model(
  "InvigilatorExperience",
  InvigilatorExperienceSchema
);
