import { Router } from "express";
import * as ExamCenterController from "../controllers/examCenter.controllers.js";

const router = new Router();

router.route("/getExamCenters").post(ExamCenterController.getExamCenters);

export default router;
