import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
    
    const {email, password, ...rest} = payload;

    const isUserExist = await User.findOne({email})

    const hashedPassword = await bcrypt.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider:IAuthProvider = {
        provider: "credentials", providerId: email as string
    }
    if(isUserExist){
        throw new AppError(httpStatus.BAD_GATEWAY, "User already Exist")
    }

    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })

    return user
}


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const ifUserExist = await User.findById(userId);

    if(!ifUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }


    if(payload.role){
        
        if( payload.role === Role.SUPER_ADMIN && 
            (decodedToken.role === Role.ADMIN 
            || decodedToken.role === Role.SENDERS 
            || decodedToken.role === Role.RECEIVER) 
        ){
            throw new AppError(httpStatus.FORBIDDEN, "You're not authorized");
        }
    }

    if( payload.isActive || payload.isDeleted || payload.isVerified ){
        if( decodedToken.role === Role.SENDERS || decodedToken.role === Role.RECEIVER ){
            throw new AppError(httpStatus.FORBIDDEN, "You're not authorized");
        }
    }

    if(payload.password){
        payload.password = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUND);
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true })

    return newUpdateUser;

}


const getAllUsers = async () => {
    const users = await User.find({})
    const totalUser = await User.countDocuments;

    return{
        data: users,
        meta: totalUser
    }
}


export const UserServices = { createUser, updateUser, getAllUsers }