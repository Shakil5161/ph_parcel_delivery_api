import { model, Schema } from "mongoose";
import { IParcel, IStatusLog, ParcelStatus } from "./parcel.interface";

const StatusLogSchema = new Schema<IStatusLog>(
  {
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    location: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  { _id: false }
);



const parcelSchema = new Schema<IParcel>({
    title: {type: String, required: true},
    trackingId: {type: String, unique: true},
    weight: {type: Number, min: 0},
    dimensions: {
        length: {type: String, min: 0},
        width: {type: String, min: 0},
        height: {type: String, min: 0},
    },
    fee: {type: Number, min: 0},
    sender: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiver: {
        email: {type: String, require: true},
        name: {type: String, require: true},
        phone: {type: String, require: true},
        address: {type: String, require: true},
    },
    pickupDate: {type: Date},
    expectedDeliveryDate: {type: Date},
    actualDeliveryDate: {type: Date, default: null},
    status: {
        type: String,
        enum: Object.values(ParcelStatus),
        default: ParcelStatus.REQUESTED,
        require: true
    },
    statusLogs: { type: [StatusLogSchema], default: [] },
    isCanceled: {type: Boolean, default: false},
    isReturned: {type: Boolean, default: false},
    isBlocked: {type: Boolean, default: false},
    isHeld: {type: Boolean, default: false},
    isDelivered: {type: Boolean, default: false},
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },

}, 
{ timestamps: true })

parcelSchema.pre("save", async function (next) {
  console.log("pre save hook", next)

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); 
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); 
  this.trackingId = `TRK-${datePart}-${random}`;
console.log("this.trackingId", this.trackingId)
})



export const Parcel = model<IParcel>("Parcel", parcelSchema)