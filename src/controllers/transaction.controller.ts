import { Request, Response } from "express";

import { HTTP_STATUS } from "../configs/http.config";

import { TransactionTypeEnum } from "../models/transaction.model";

import { asyncHandler } from "../middlewares/async-handler.middleware";

import {
  createTransactionService,
  deleteTransactionByIdService,
  duplicateTransactionByIdService,
  getAllTransactionService,
  getTransactionByIdService,
  updateTransactionByIdService,
} from "../services/transaction.service";

import {
  createTransactionSchema,
  transactionIdSchema,
  updateTransactionSchema,
} from "../validators/transaction.validator";

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

export const getAllTransactionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const filters = {
      keyword: req.query.keyword as string | undefined,
      type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
      recurringStatus: req.query.recurringStatus as
        | "RECURRING"
        | "NON_RECURRING"
        | undefined,
    };

    // pagination
    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllTransactionService(userId, filters, pagination);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transactions fetched successfully",
      data: result,
    });
  }
);

export const getTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const result = await getTransactionByIdService(userId, transactionId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction fetched successfully",
      data: result,
    });
  }
);

export const duplicateTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    const result = await duplicateTransactionByIdService(userId, transactionId);

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: result,
    });
  }
);

export const updateTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);
    const body = updateTransactionSchema.parse(req.body);

    const result = await updateTransactionByIdService(
      userId,
      transactionId,
      body
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Transaction duplicated successfully",
      data: result,
    });
  }
);

export const deleteTransactionByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const transactionId = transactionIdSchema.parse(req.params.id);

    await deleteTransactionByIdService(userId, transactionId);

    return res.status(HTTP_STATUS.NO_CONTENT).json({
      message: "Transaction deleted successfully",
    });
  }
);
