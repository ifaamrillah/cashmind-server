import { Request, Response } from "express";

import { HTTP_STATUS } from "../configs/http.config";

import { asyncHandler } from "../middlewares/async-handler.middleware";

import { findUserByIdService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findUserByIdService(userId);
    return res.status(HTTP_STATUS.OK).json({
      message: "User fetched successfully",
      data: user,
    });
  }
);
