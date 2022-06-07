import { Router } from "express";
import * as ExamCenterDataController from "../controllers/examCenterData.controllers.js";

const router = new Router();

router
  .route("/getExamCenterData")
  .post(ExamCenterDataController.getExamCenterData);
router
  .route("/submitExamCenterData")
  .post(ExamCenterDataController.submitExamCenterData);
router
  .route("/updateExamCenterData")
  .post(ExamCenterDataController.updateExamCenterData);
router
  .route("/reviewExamCenterData")
  .post(ExamCenterDataController.reviewExamCenterData);
router
  .route("/getExamCenterDataForReport")
  .post(ExamCenterDataController.getExamCenterDataForReport);

export default router;
