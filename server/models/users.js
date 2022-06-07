import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  login: { type: "String" },
  password: { type: "String" },
  userGroup: { type: "String" },
  school: { type: Schema.Types.ObjectId, ref: "School" },
  district: { type: "String" },
  status: { type: "Number", default: 1 },
});

export default mongoose.model("User", UserSchema);
