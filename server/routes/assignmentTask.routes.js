import { Router } from "express";
import * as AssignmentTaskController from "../controllers/assignmentTask.controllers.js";

const router = new Router();

// router.route("/getExamCenters").post(AssignmentTaskController.getExamCenters);
router
  .route("/getAssignmentTasks")
  .post(AssignmentTaskController.getAssignmentTasks);
router
  .route("/getPrincipalAssignmentTasks")
  .post(AssignmentTaskController.getPrincipalAssignmentTasks);
router
  .route("/getApprovedAssignmentTasks")
  .post(AssignmentTaskController.getApprovedAssignmentTasks);
router
  .route("/getAssignmentTasksCount")
  .post(AssignmentTaskController.getAssignmentTasksCount);
router
  .route("/getPrincipalAssignmentTasksCount")
  .post(AssignmentTaskController.getPrincipalAssignmentTasksCount);

export default router;
