import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  icNumber: { type: "String" },
  listOfInvigilatorExperience: [
    { type: Schema.Types.ObjectId, ref: "InvigilatorExperience" },
  ],
  race: { type: "String" },
  homeAddress: { type: "String" },
  postcode: { type: "String" },
  city: { type: "String" },
  state: { type: "String" },
  teacherName: { type: "String" },
  teacherPhoneNumber: { type: "String" },
  teacherSex: { type: "String" },
  teacherEmailAddress: { type: "String" },
  salaryGrade: { type: "String" },
  salary: { type: "String" },
  jpnFileCode: { type: "String" },
  teacherTypeStaffCode: { type: "String" },
  teacherPositionCode: { type: "String" },
});

export default mongoose.model("Teacher", TeacherSchema);
