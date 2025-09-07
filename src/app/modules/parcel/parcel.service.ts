import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { FilterQuery } from "mongoose";
import { envVars } from "../../config/env";
import { excludeField } from "../../utils/contants";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { IParcel, IStatusLog, ParcelStatus } from "./parcel.interface";
import { Parcel } from "./parcel.model";

export const calculateFee = (
  weight?: number,
  dimensions?: { length: number; width: number; height: number }
): number => {
  // Base fee
  let fee = 50; 

  if (weight) {
    fee += weight * 10; 
  }

  if (dimensions) {
    const dimensionalWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
    fee += dimensionalWeight * 5; 
  }

  return Math.round(fee); 
};

const createParcel = async(payload: IParcel, decodedToken: JwtPayload) => {
    const userId = decodedToken.userId
    console.log('userId', userId)

    const user = await User.findById({_id: userId});

    if (!user) {
      throw new Error("Sender user not found");
    }

    const isReceiverExist = await User.findOne({email: payload.receiver.email})

    if(!isReceiverExist){
        const hashedPassword = await bcrypt.hash( `123${payload.receiver.email}` as string, Number(envVars.BCRYPT_SALT_ROUND))

        await User.create({ email: payload.receiver.email, name: payload.receiver.name, role: Role.RECEIVER, password: hashedPassword })

    }

    const fee = calculateFee(payload.weight, payload.dimensions);

  
    const parcelData: Partial<IParcel> = {
    ...payload,
    sender: user._id, 
    fee,
    status: payload.status ?? ParcelStatus.REQUESTED,
    createdAt: payload.createdAt ?? new Date(),
    updatedAt: payload.updatedAt ?? new Date(),
  };

  const createdParcel = await Parcel.create(parcelData);
  return createdParcel;

}



const getParcelsForUser = async (query: Record<string, string>, decodedToken: JwtPayload) => {
    const filter = query;
    const status = query.status;
    const sort = query.sort || '-createdAt';
    const trackId = query.trackId;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit

    const userId = decodedToken.userId
    const userRole = decodedToken.role
    const userEmail = decodedToken.email
    const userBy: FilterQuery<IParcel> = {};

    console.log("userId", userId, "userRole", userRole)
    // field filtering
    const fields = query.fields?.split(',').join(' ') || ''
    delete filter['searchTerm']

    for( const field of excludeField){
        delete filter[field]
    }

    if (trackId) {
        filter.trackingId = trackId;
    }
    
    console.log(filter, 'filter')
    
        if (Role.SENDERS === userRole ) {
            userBy.sender = userId;
        } else if ( Role.RECEIVER === userRole ) {
            userBy["receiver.email"] = userEmail;
        } else if ( Role.ADMIN === userRole || Role.SUPER_ADMIN) {
            
        } else {
            throw new Error("Unsupported role for parcel retrieval");
        }

        if (status) {
            filter.status = status;
        }

    const parcel = await Parcel.find(userBy).find(filter).sort(sort).select(fields).skip(skip).limit(limit);

    const totalParcel = await Parcel.find(userBy).find(filter).sort(sort).select(fields).skip(skip).limit(limit).countDocuments();
    
    
     return {
        meta: {
            total: totalParcel
        },
        data: parcel
    }
}
const getAllParcels = async (query: Record<string, string>) => {
    const filter = { ...query };
    const trackId = query.trackId;
    const status = query.status;
    const sort = query.sort || '-createdAt';


    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit

    const userBy: FilterQuery<IParcel> = {};

    // field filtering
    const fields = query.fields?.split(',').join(' ') || ''
    delete filter['searchTerm']

    for( const field of excludeField){
        delete filter[field]
    }
    
     if (trackId) {
        filter.trackingId = trackId;
    }
    if (status) {
        filter.status = status;
    }

    const parcel = await Parcel.find(userBy).find(filter).sort(sort).select(fields).skip(skip).limit(limit);

    const totalParcel = await Parcel.find(userBy).find(filter).sort(sort).select(fields).skip(skip).limit(limit).countDocuments();
    
    
     return {
        meta: {
            total: totalParcel
        },
        data: parcel
    }
}

const updateParcel = async (
  parcelId: string,
  updates: Partial<IParcel> & { status?: ParcelStatus },
  decodedToken: JwtPayload & { userId: string; role: string; email?: string }
) => {
  const userId = decodedToken.userId;
  const userRole = decodedToken.role;
  const userEmail = decodedToken.email;

  const parcel = await Parcel.findById(parcelId);
  if (!parcel) {
    throw new Error("Parcel not found");
  }

  if ( 
      userId !== parcel.sender.toString() &&
      userRole !== Role.ADMIN &&
      userRole !== Role.SUPER_ADMIN &&
      userEmail !== parcel.receiver.email
    ) {
      throw new Error("You are not permitted to update this parcel");
    }


  if (parcel.isBlocked) {
    throw new Error("Parcel is blocked and cannot be updated");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if ((user as any).isBlocked) {
    throw new Error("User is blocked");
  }


  const currentStatus = parcel.status;

  const changedFields: string[] = [];

  
  if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
    if (updates.trackingId && updates.trackingId !== parcel.trackingId) {
      throw new Error("Cannot modify trackingId");
    }

    const forbidden = ["trackingId"];
    for (const key of Object.keys(updates) as Array<keyof typeof updates>) {
      if (forbidden.includes(key as string)) continue;
      // @ts-ignore
      if (updates[key] !== undefined && parcel.get(key) !== updates[key]) {
        // @ts-ignore
        parcel.set(key, updates[key]);
        changedFields.push(key as string);
      }
    }
  } else if (userRole === Role.SENDERS) {
    const allowedSenderFields = [
      "description",
      "weight",
      "dimensions",
      "expectedDeliveryDate",
      "pickupDate",
    ];

    for (const key of Object.keys(updates) as Array<keyof typeof updates>) {
      if (key === "status") continue; // handle separately
      if (!allowedSenderFields.includes(key as string)) continue;
      // @ts-ignore
      if (updates[key] !== undefined && parcel.get(key) !== updates[key]) {
        // @ts-ignore
        parcel.set(key, updates[key]);
        changedFields.push(key as string);
      }
    }

    if (updates.status && updates.status !== currentStatus) {
      if (
        currentStatus === ParcelStatus.REQUESTED &&
        updates.status === ParcelStatus.CANCELED
      ) {
        parcel.status = ParcelStatus.CANCELED;
        changedFields.push("status");
        parcel.isCanceled = true;
      } else {
        throw new Error(
          `Sender can only change status from Requested to Canceled`
        );
      }
    } else if (updates.assignedTo){
        throw new Error( ` ${userRole}, You can't update assignedTo`);
    }
  } else if (userRole === Role.RECEIVER) {
    // Receiver can only update status from IN_TRANSIT -> DELIVERED
    if (updates.status && updates.status !== currentStatus) {
      if (
        currentStatus === ParcelStatus.IN_TRANSIT &&
        updates.status === ParcelStatus.DELIVERED
      ) {
        parcel.status = ParcelStatus.DELIVERED;
        changedFields.push("status");
        parcel.actualDeliveryDate = new Date();
        parcel.isDelivered = true;
      } else {
        throw new Error(
          "Receiver can only update status from In Transit to Delivered"
        );
      }
    }
    else if (updates.assignedTo){
        throw new Error( ` ${userRole}, You can't update assignedTo`);
    }
   
  } else {
    throw new Error("Unauthorized role for updating parcel");
  }


  if (
    (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) &&
    updates.status &&
    updates.status !== currentStatus
  ) {
    parcel.status = updates.status;
    changedFields.push("status");

    if ( updates.status === ParcelStatus.DELIVERED ) {
      parcel.actualDeliveryDate = new Date();
      parcel.isDelivered = true;
    }
    if (updates.status === ParcelStatus.CANCELED) {
      parcel.isCanceled = true;
    }
    if (updates.status === ParcelStatus.RETURNED) {
      parcel.isReturned = true;
    }
    if (updates.status === ParcelStatus.HELD) {
      parcel.isHeld = true;
    }
    if (updates.status === ParcelStatus.BLOCKED) {
      parcel.isBlocked = true;
    }
  }

  if( updates.weight || updates.dimensions ){
    parcel.fee = calculateFee(updates.weight || parcel.weight, updates.dimensions || parcel.dimensions);
  }
   


  parcel.updatedAt = new Date();
 
  
  const logEntry: IStatusLog = {
    status: parcel.status!,
    timestamp: new Date(),
    updatedBy: new mongoose.Types.ObjectId(userId),
    location: updates.pickupDate ? "Sender update" : undefined,
    note:
      changedFields.length > 0
        ? `Updated fields: ${changedFields.join(", ")} by ${userRole}`
        : "Checked with no changes",
  };

  parcel.statusLogs = parcel.statusLogs || [];
  parcel.statusLogs.push(logEntry as any);

  const updated = await parcel.save();
  return updated;
};

export const ParcelService = {
    createParcel,
    getParcelsForUser,
    getAllParcels,
    updateParcel
}