import { Router } from "express";
import * as AdminController from "../controllers/admin.controllers.js";

const router = new Router();

router.route("/registerUser").post(AdminController.registerUser);

export default router;
