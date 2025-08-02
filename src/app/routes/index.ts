import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { ParcelRoutes } from "../modules/parcel/parcel.route";
import { UserRoutes } from "../modules/user/user.route";

export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/parcels",
        route: ParcelRoutes
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})