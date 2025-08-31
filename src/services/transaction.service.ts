import axios from "axios";
import { createPartFromBase64, createUserContent } from "@google/genai";

import { genAIModel, getAI } from "../configs/google-ai.config";

import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";

import {
  CreateTransactionSchemaType,
  UpdateTransactionSchemaType,
} from "../validators/transaction.validator";

import { calculateNextOccurrence } from "../utils/helper";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { receiptPrompt } from "../utils/prompt";

export const getTransactionsService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: "RECURRING" | "NON_RECURRING";
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const { keyword, type, recurringStatus } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      {
        title: {
          $regex: keyword,
          $options: "i",
        },
        category: {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) {
    throw new NotFoundException("Transaction not found");
  }

  return transaction;
};

export const createTransactionService = async (
  body: CreateTransactionSchemaType,
  userId: string
) => {
  const { date, isRecurring, recurringInterval, category, amount } = body;

  let nextRecurringDate: Date | undefined;

  const currentDate = new Date();

  if (isRecurring && recurringInterval) {
    const calculatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurrence(currentDate, recurringInterval)
        : calculatedDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: category || "Other",
    amount: Number(amount),
    isRecurring: isRecurring || false,
    recurringInterval: recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  return transaction;
};

export const createTransactionsService = async (
  userId: string,
  transactions: CreateTransactionSchemaType[]
) => {
  try {
    const bulkOps = transactions.map((trx) => ({
      insertOne: {
        document: {
          ...trx,
          userId,
          isRecurring: false,
          nextRecurringDate: null,
          recurringInterval: null,
          lastProcessed: null,
          createdAt: new Date(),
          updateAt: new Date(),
        },
      },
    }));

    const result = await TransactionModel.bulkWrite(bulkOps, {
      ordered: true,
    });

    return {
      insertedCount: result.insertedCount,
    };
  } catch (error) {
    throw error;
  }
};

export const duplicateTransactionByIdService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!transaction) {
    throw new NotFoundException("Transaction not found");
  }

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
      ? `${transaction.description} (Duplicate)`
      : "Duplicated transaction",
    isReccuring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionByIdService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionSchemaType
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });
  if (!existingTransaction) {
    throw new NotFoundException("Transaction not found");
  }

  const currentDate = new Date();

  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;
  const date =
    body.date !== undefined ? new Date(body.date) : existingTransaction.date;
  const recurringInterval =
    body.recurringInterval || existingTransaction.recurringInterval;

  let nextRecurringDate: Date | undefined;

  if (isRecurring && recurringInterval) {
    const calculatedDate = calculateNextOccurrence(date, recurringInterval);

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurrence(currentDate, recurringInterval)
        : calculatedDate;
  }

  existingTransaction.set({
    ...(body.title && {
      title: body.title,
    }),
    ...(body.description && {
      description: body.description,
    }),
    ...(body.category && {
      category: body.category,
    }),
    ...(body.type && {
      type: body.type,
    }),
    ...(body.paymentMethod && {
      paymentMethod: body.paymentMethod,
    }),
    ...(body.amount !== undefined && {
      amount: Number(body.amount),
    }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  return existingTransaction;
};

export const deleteTransactionByIdService = async (
  userId: string,
  transactionId: string
) => {
  const deleted = await TransactionModel.findByIdAndDelete({
    _id: transactionId,
    userId,
  });

  if (!deleted) {
    throw new NotFoundException("Transaction not found");
  }

  return;
};

export const deleteTransactionsByIdsService = async (
  userId: string,
  transactionsIds: string[]
) => {
  const foundTransactions = await TransactionModel.find({
    _id: { $in: transactionsIds },
    userId,
  }).select("_id");

  const foundIds = foundTransactions.map((t) => t._id.toString());
  const notFoundIds = transactionsIds.filter((id) => !foundIds.includes(id));

  if (notFoundIds.length > 0) {
    throw new NotFoundException(
      `Some transactions not found: ${notFoundIds.join(", ")}`
    );
  }

  const deleted = await TransactionModel.deleteMany({
    _id: { $in: transactionsIds },
    userId,
  });

  return {
    deletedCount: deleted.deletedCount,
  };
};

export const scanReceiptService = async (
  file: Express.Multer.File | undefined
) => {
  if (!file) {
    throw new BadRequestException("File not found");
  }

  try {
    if (!file.path) {
      throw new BadRequestException("Failed to upload file");
    }

    const responseData = await axios.get(file.path, {
      responseType: "arraybuffer",
    });

    const base64String = Buffer.from(responseData.data).toString("base64");

    if (!base64String) {
      throw new BadRequestException("Could not process file");
    }

    const result = await getAI.models.generateContent({
      model: genAIModel,
      contents: [
        createUserContent([
          receiptPrompt,
          createPartFromBase64(base64String, file.mimetype),
        ]),
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    });

    const response = result.text;
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();

    if (!cleanedText) {
      return {
        error: "Could not read receipt content",
      };
    }

    const data = JSON.parse(cleanedText);

    if (!data?.amount || !data?.date) {
      return {
        error: "Receipt missing required fields",
      };
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      receiptUrl: file.path,
    };
  } catch (error) {
    return {
      error: "Receipt scanning service unavailable",
    };
  }
};
