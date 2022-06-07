import * as autoIncrement from "mongoose-auto-increment";

import mongoose from "mongoose";

const Schema = mongoose.Schema;

const SchoolSchema = new Schema({
  schoolCode: { type: "String", required: true },
  schoolName: { type: "String", required: true },
  schoolAddress: { type: "String", required: true },
  district: { type: "String", required: true },
  postcode: { type: "String", required: true },
  city: { type: "String", required: true },
  stateCode: { type: "String", required: true },
  areaCode: { type: "String", required: true },
  schoolPhoneNumber: { type: "String", required: true },
  schoolEmailAddress: { type: "String", required: true },
  typeOfSchool: { type: "String", required: true },
  codeDun: { type: "String", required: true },
  codeParlimen: { type: "String", required: true },
  taxNumber: { type: "String", required: true },
  examCenters: { type: "Array", default: [] },
});

export default mongoose.model("School", SchoolSchema);
