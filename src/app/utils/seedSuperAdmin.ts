import bcrypt from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
    try {
        
        const isSupperAdminExist = await User.findOne({ email: envVars.SUPER_ADMIN_EMAIL });

        if(isSupperAdminExist){
            console.log("Supper Admin Already Exists!")
            return
        }

        console.log("Supper admin is creating....");

        const hashedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND));

        const authProvider: IAuthProvider ={
            provider: "credentials",
            providerId: envVars.SUPER_ADMIN_PASSWORD
        }

        const payload: IUser = {
            name: "Supper Admin",
            role: Role.SUPER_ADMIN,
            email: envVars.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superAdmin = await User.create(payload);
        console.log("Super Admin Created Successfully! \n", envVars.SUPER_ADMIN_EMAIL);
        console.log(superAdmin);

    } catch (error) {
        console.log(error)
    }
}