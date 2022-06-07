import mongoose from "mongoose";

const Schema = mongoose.Schema;

// const ExamCenterDataSchema = new Schema({
//   examCentreCode: { type: "String" },
//   examCentreName: { type: "String" },
//   examAreaCode: { type: "String" },
//   examAreaName: { type: "String" },
//   roomAvailable: { type: "Number" },
//   specialRoomAvailable: { type: "Number" },
//   hallAvailable: { type: "Number" },
//   roomCandidateNumber: { type: "Number" },
//   specialRoomCandidateNumber: { type: "Number" },
//   hallCandidateNumber: { type: "Number" },
//   numberKetuaPengawasRequired: { type: "Number" },
//   numberPengawasRequired: { type: "Number" },
//   assignmentTaskID: { type: Schema.Types.ObjectId, ref: "AssignmentTask" },
//   numberKetuaPengawas: { type: "Number" },
//   numberTimbKetuaPengawas: { type: "Number" },
//   numberPengawas: { type: "Number" },
//   numberPengemasBilik: { type: "Number" },
//   ICListKetuaPengawas: { type: "Array", default: [] },
//   ICListTimbKetuaPengawas: { type: "Array", default: [] },
//   ICListPengawas: { type: "Array", default: [] },
//   ICListKetuaPengawas: { type: "Array", default: [] },
//   ICListPengemasBilik: { type: "Array", default: [] },
//   statusExamCentreData: { type: "String" },
//   totalNumberPengawas: { type: "Number" },
//   examYear: { type: "String" },
//   examCode: { type: "String" },
//   examName: { type: "String" },
//   computedTotalPengawasRequired: { type: "Number" },
//   codeSafeRoom: { type: "String" },
// });
const ExamCenterDataSchema = new Schema({
  examCenter: { type: Schema.Types.ObjectId, ref: "ExamCenter" },
  assignmentTaskID: { type: Schema.Types.ObjectId, ref: "AssignmentTask" },

  roomAvailable: { type: "Number" },
  specialRoomAvailable: { type: "Number" },
  hallAvailable: { type: "Number" },
  roomCandidateNumber: { type: "Number" },
  specialRoomCandidateNumber: { type: "Number" },
  hallCandidateNumber: { type: "Number" },

  numberOfChiefInvigilatorRequired: { type: "Number" },
  numberOfViceChiefInvigilatorRequired: { type: "Number" },
  numberOfEnvironmentalSupervisorRequired: { type: "Number" },
  numberOfRoomKeeperRequired: { type: "Number" },
  numberOfInvigilatorRequired: { type: "Number" },
  numberOfReservedInvigilatorRequired: { type: "Number" },

  listChiefInvigilatorRequired: [{ type: Schema.Types.ObjectId }],
  listViceChiefInvigilatorRequired: [{ type: Schema.Types.ObjectId }],
  listEnvironmentalSupervisorRequired: [{ type: Schema.Types.ObjectId }],
  listRoomKeeperRequired: [{ type: Schema.Types.ObjectId }],
  listInvigilatorRequired: [{ type: Schema.Types.ObjectId }],
  listReservedInvigilatorRequired: [{ type: Schema.Types.ObjectId }],
});

export default mongoose.model("ExamCenterData", ExamCenterDataSchema);
