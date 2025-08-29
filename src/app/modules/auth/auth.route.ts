import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router()

router.post('/login', AuthControllers.CredentialsLogin)
router.post('/logout', AuthControllers.logout)

router.post('/refresh-token', AuthControllers.getNewAccessToken)

export const AuthRoutes = router