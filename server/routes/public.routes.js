import { Router } from "express";
import * as AdminController from "../controllers/admin.controllers.js";

const router = new Router();
router.route("/login").post(AdminController.login);

export default router;
