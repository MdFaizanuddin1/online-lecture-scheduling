import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller.js";

const route = Router()

route.get("/",healthCheck)

export default route;