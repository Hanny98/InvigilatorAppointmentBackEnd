import { Router } from "express";
import * as TeacherController from "../controllers/teacher.controllers.js";

const router = new Router();

router.route("/getTeacher").post(TeacherController.getTeacher);
router.route("/updateTeacher").post(TeacherController.updateTeacher);
router.route("/completeTeacher").post(TeacherController.completeTeacher);
router.route("/getOneTeacher").post(TeacherController.getOneTeacher);
router.route("/getTeacherList").post(TeacherController.getTeacherList);
router
  .route("/getTeacherInvigilatorExperience")
  .post(TeacherController.getTeacherInvigilatorExperience);

export default router;
