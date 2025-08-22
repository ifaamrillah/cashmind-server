import TransactionModel, {
  TransactionTypeEnum,
} from "../models/transaction.model";

import {
  CreateTransactionSchemaType,
  UpdateTransactionSchemaType,
} from "../validators/transaction.validator";

import { calculateNextOccurrence } from "../utils/helper";
import { NotFoundException } from "../utils/app-error";

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

export const getAllTransactionService = async (
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
