import TransactionModel from "../models/transaction.model";

import { CreateTransactionSchema } from "../validators/transaction.validator";

import { calculateNextOccurrence } from "../utils/helper";

export const createTransactionService = async (
  body: CreateTransactionSchema,
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
