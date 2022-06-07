import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ExamCenterSchema = new Schema({
  examCenterCode: { type: "String" },
  safeRoomNo: { type: "String" },
  school: { type: Schema.Types.ObjectId, ref: "School" },
  // assingmentTaks: { type: "Array", default: [] },
  assignmentTasks: [{ type: Schema.Types.ObjectId, ref: "AssignmentTask" }],
});

export default mongoose.model("ExamCenter", ExamCenterSchema);
