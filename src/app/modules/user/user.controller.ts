import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
console.log(req.body, 'payload')
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Created Successfully",
        data: user
    })
})

const updateUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;


    const verifiedToken = req.user
    const payload = req.body
    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User Updated Successfully",
        data: user
    })
})

const getAllUsers = catchAsync( async(req: Request, res: Response, next: NextFunction) => {

    const role = req.query.role as string | undefined;
    const users = await UserServices.getAllUsers(role);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All User Retrieved Successfully",
        data: users.data,
    })
})

const getMe = catchAsync( async(req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload
    console.log(decodedToken, 'decodedToken from getMe')
    const result = await UserServices.getMe(decodedToken.userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    })

})
export const UserControllers = { createUser, updateUser, getAllUsers, getMe } 