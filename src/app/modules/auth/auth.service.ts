import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";

const loginUser = async (payload: Partial<IUser>) => {
    console.log(payload, 'payload')
    const { email, password } = payload;

    const isUserExist = await User.findOne({ email })

    
    if(!isUserExist){
        throw new AppError(httpStatus.BAD_GATEWAY, "Email does not exist")
    }
    
    const hashedPassword = await bcrypt.compare(password as string, isUserExist.password as string )
    
    if(!hashedPassword){
        throw new AppError(httpStatus.BAD_GATEWAY, "Incorrect password")
    }
    
    const userTokens = createUserTokens(isUserExist);


    const {password: pass, ...rest} = isUserExist.toObject() 

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
        
    } 
}

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}

export const AuthServices = {
    loginUser,
    getNewAccessToken,
}