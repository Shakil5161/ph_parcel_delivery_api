import { z } from "zod";

export const ParcelStatusEnum = z.enum([
  "Requested",
  "Approved",
  "Dispatched",
  "In Transit",
  "Delivered",
  "Canceled",
  "Returned",
  "Held",
  "Blocked",
]);

export const AddressSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
});

const coerceDate = z.preprocess((val) => {
  if (typeof val === "string" || val instanceof Date) return new Date(val as any);
  return val;
}, z.date());

export const StatusLogSchema = z.object({
  status: ParcelStatusEnum,
  timestamp: coerceDate.optional().default(() => new Date()),
  updatedBy: z.string(),
  location: z.string().optional(),
  note: z.string().optional(),
});

export const DimensionsSchema = z.object({
  length: z.number().nonnegative(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
});

export const ParcelZodSchema = z.object({
  title: z.string().min(1),
  trackingId: z.string().min(1).optional(),
  weight: z.number().nonnegative().optional(),
  description: z.string().optional(),
  dimensions: DimensionsSchema.optional(),
  fee: z.number().nonnegative().optional(),
  sender: z.string().optional(),
  receiver: AddressSchema,
  pickupDate: coerceDate.optional(),
  expectedDeliveryDate: coerceDate.optional(),
  actualDeliveryDate: z.union([coerceDate, z.null()]).optional(),
  status: ParcelStatusEnum.default("Requested"),
  statusLogs: z.array(StatusLogSchema).optional().default([]),
  isCanceled: z.boolean().optional().default(false),
  isReturned: z.boolean().optional().default(false),
  isBlocked: z.boolean().optional().default(false),
  isHeld: z.boolean().optional().default(false),
  isDelivered: z.boolean().optional().default(false),
  assignedTo: z.string().optional(),
  createdAt: coerceDate.optional(),
  updatedAt: coerceDate.optional(),
});


export const ParcelUpdateZodSchema = z.object({
  status: ParcelStatusEnum.optional(),
  expectedDeliveryDate: coerceDate.optional(),
  receiver: z
    .object({
      email: z.string().email().optional(),
      name: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      address: z.string().min(1).optional(),
    })
    .partial()
    .optional(),
  title: z.string().min(1).optional(),
  weight: z.number().nonnegative().optional(),
  dimensions: DimensionsSchema.optional(),
  fee: z.number().nonnegative().optional(),
  assignedTo: z.string().optional(),
  pickupDate: coerceDate.optional(),
  actualDeliveryDate: z.union([coerceDate, z.null()]).optional(),
  isBlocked: z.boolean().optional(),
  isHeld: z.boolean().optional(),
  isReturned: z.boolean().optional(),
  isCanceled: z.boolean().optional(),
});