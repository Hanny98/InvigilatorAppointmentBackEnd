import Express from "express";
import config from "./config.js";
import errorHandler from "./util/errorHandler.js";
// import dotenv from "dotenv"
//Define require
import { createRequire } from "module";
import mongoose from "mongoose";
const require = createRequire(import.meta.url);
const cors = require("cors");

//import routes
import adminRoute from "./routes/admin.routes.js";
import userRoute from "./routes/user.routes.js";
import publicRoute from "./routes/public.routes.js";
import schoolRoute from "./routes/school.routes.js";
import teacherRoute from "./routes/teacher.routes.js";
import examCenterRoute from "./routes/examCenter.routes.js";
import assignmentTaskRoute from "./routes/assignmentTask.routes.js";
import examCenterDataRoute from "./routes/examCenterData.routes.js";
import { authAdmin } from "./util/tokenVerification.js";

//Connect to mongodb
mongoose
  .connect(config.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to Database"))
  .catch((error) => console.log(error.message));

// console.log(mongoose.connection);

//Initialize the Express App
const app = new Express();
//Apply body Parser and server public assets and routes
app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded({ limit: "20mb", extended: false }));
//Public API
app.use("/api", publicRoute);

//Private API
app.use("/api", authAdmin);
app.use("/api/admin", adminRoute);
app.use("/api/school", schoolRoute);
app.use("/api/teacher", teacherRoute);
app.use("/api/user", userRoute);
app.use("/api/assignmentTask", assignmentTaskRoute);
app.use("/api/examCenter", examCenterRoute);
app.use("/api/examCenterData", examCenterDataRoute);

app.use(errorHandler);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));
app.listen(config.port, (error) => {
  if (!error) {
    console.log(`running`);
  }
});

export default app;
