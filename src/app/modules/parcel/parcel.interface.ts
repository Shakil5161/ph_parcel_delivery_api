
import { Types } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "Requested",
  APPROVED = "Approved",
  DISPATCHED = "Dispatched",
  IN_TRANSIT = "In Transit",
  DELIVERED = "Delivered",
  CANCELED = "Canceled",
  RETURNED = "Returned",
  HELD = "Held",
  BLOCKED = "Blocked",
}

// parcel.ts
export interface IAddress {
  email: string;
  name: string;
  phone: string;
  address: string;
}

export interface IStatusLog {
  status: ParcelStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId | string; 
  location?: string;
  note?: string;
}

export interface IParcel {
  title: string; 
  trackingId: string; 
  description?: string;
  weight?: number; 
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  fee?: number; 
  sender: Types.ObjectId
  receiver: IAddress;
  pickupDate?: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date | null;
  status?: ParcelStatus;
  statusLogs: IStatusLog[];
  isCanceled?: boolean;
  isReturned?: boolean;
  isBlocked?: boolean;
  isHeld?: boolean;
  isDelivered?: boolean;
  assignedTo?: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}




export interface IUpdateParcel {
  status?: ParcelStatus;
  statusLogs?: IStatusLog[];
  expectedDeliveryDate?: Date | string;
  receiver?: {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;
  };
  // other updatable fields for admin/superadmin
  title?: string;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  fee?: number;
  assignedTo?: Types.ObjectId;
  pickupDate?: Date | string;
  actualDeliveryDate?: Date | string | null;
  // you can extend as needed
  isBlocked?: boolean;
  isHeld?: boolean;
  isReturned?: boolean;
  isCanceled?: boolean;
  // Note: trackingId must not be editable
}