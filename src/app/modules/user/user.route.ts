import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { updateUserZodSchema } from "./user.validation";


const router = Router()

// /api/v1/user/register
router.post('/register', UserControllers.createUser )

router.get("/all-user",checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers)
router.get("/me",checkAuth(...Object.values(Role)), UserControllers.getMe)

router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)





export const UserRoutes = router