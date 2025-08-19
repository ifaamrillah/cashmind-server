import { Request, Response } from "express";

import { HTTP_STATUS } from "../configs/http.config";

import { asyncHandler } from "../middlewares/async-handler.middleware";

import { createTransactionService } from "../services/transaction.service";

import { createTransactionSchema } from "../validators/transaction.validator";

export const createTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body);
    const userId = req.user?._id;

    console.log("User", userId);

    const result = await createTransactionService(body, userId);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Transaction created successfully",
      data: result,
    });
  }
);
