import { Router } from "express";
import * as UserController from "../controllers/user.controllers.js";

const router = new Router();

router.route("/getUsers").post(UserController.getUsers);
router.route("/updateUser").post(UserController.updateUser);
router.route("/getLoginUser").post(UserController.getLoginUser);
router.route("/getCurrentSchoolUser").post(UserController.getCurrentSchoolUser);

export default router;
