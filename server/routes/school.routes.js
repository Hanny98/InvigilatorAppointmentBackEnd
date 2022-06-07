import { Router } from "express";
import * as SchoolController from "../controllers/school.controllers.js";

const router = new Router();

router.route("/getSchool").post(SchoolController.getSchool);
router.route("/updateSchool").post(SchoolController.updateSchool);
router.route("/getSchoolList").post(SchoolController.getSchoolList);

export default router;
