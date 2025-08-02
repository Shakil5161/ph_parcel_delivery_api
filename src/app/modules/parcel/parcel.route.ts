import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { Role } from "../user/user.interface";
import { ParcelController } from "./parcel.controller";
import { ParcelUpdateZodSchema, ParcelZodSchema } from "./parcel.validation";

const router = express.Router()


router.post("/create",
    checkAuth(...Object.values(Role)),
    validateRequest(ParcelZodSchema),
    ParcelController.createParcel
 )

router.get("/me",
    checkAuth(...Object.values(Role)),
    ParcelController.getMyParcel
)
router.get("/all",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ParcelController.getAllParcel
)

router.patch("/:id",
    checkAuth(...Object.values(Role)),
    validateRequest(ParcelUpdateZodSchema),
    ParcelController.updateParcel
 )




 export const ParcelRoutes = router