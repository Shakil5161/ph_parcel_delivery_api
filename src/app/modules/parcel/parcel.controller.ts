import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ParcelService } from "./parcel.service";

const createParcel = catchAsync( async(req: Request, res: Response, next: NextFunction) => {

    // const token = req.headers.authorization
    const verifiedToken = req.user
    
    const result = await ParcelService.createParcel(req.body, verifiedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Parcel retrieved successfully',
        data: result
    });
})


const updateParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const parcelId = req.params.id; 
    const updates = req.body;
    const verifiedToken = req.user as any; 

    const result = await ParcelService.updateParcel(
      parcelId,
      updates,
      verifiedToken
    );

     sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Parcel updated successfully",
      data: result,
    });
  }
);

const getMyParcel = catchAsync( async(req: Request, res: Response, next: NextFunction) => {

    // const token = req.headers.authorization
    const verifiedToken = req.user
    const query = req.query

    const result = await ParcelService.getParcelsForUser(query as Record<string, string>, verifiedToken as JwtPayload)

    sendResponse(res, {
         statusCode: httpStatus.OK,
        success: true,
        message: 'Parcel is created successfully',
        data: result,
    });
})

const getAllParcel = catchAsync( async(req: Request, res: Response, next: NextFunction) => {

    const query = req.query

    const result = await ParcelService.getAllParcels(query as Record<string, string>)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Parcel is retrieved successfully',
        data: result,
    });
})

export const ParcelController = {
    createParcel,
    getMyParcel,
    updateParcel,
    getAllParcel
}