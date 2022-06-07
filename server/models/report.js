import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  reportName: { type: "String" },
  reportType: { type: "String" },
});

export default mongoose.model("Report", ReportSchema);
