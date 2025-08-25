import { z } from "zod";

import {
  PaymentMethodEnum,
  RecurringIntervalEnum,
  TransactionTypeEnum,
} from "../models/transaction.model";

export const transactionIdSchema = z.string().trim().min(1);

export const baseTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE], {
    errorMap: () => ({
      message: "Transaction type must either INCOME or EXPENSE",
    }),
  }),
  amount: z.number().positive("Amount must be greater than 0").min(1),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z
    .union([z.string().datetime({ message: "Invalid date format" }), z.date()])
    .transform((value) => new Date(value)),
  isRecurring: z.boolean().default(false),
  recurringInterval: z
    .enum([
      RecurringIntervalEnum.DAILY,
      RecurringIntervalEnum.MONTHLY,
      RecurringIntervalEnum.WEEKLY,
      RecurringIntervalEnum.YEARLY,
    ])
    .nullable()
    .optional(),
  receiptUrl: z.string().optional(),
  paymentMethod: z
    .enum([
      PaymentMethodEnum.CASH,
      PaymentMethodEnum.BANK_TRANSFER,
      PaymentMethodEnum.MOBILE_PAYMENT,
      PaymentMethodEnum.CARD,
      PaymentMethodEnum.AUTO_DEBIT,
      PaymentMethodEnum.OTHER,
    ])
    .default(PaymentMethodEnum.CASH),
});

export const createTransactionSchema = baseTransactionSchema;
export const updateTransactionSchema = baseTransactionSchema.partial();

export const deleteTransactionsByIdsSchema = z.object({
  transactionsIds: z
    .array(z.string().length(24, "Invalid transaction id"))
    .min(1, "at least one transaction id is required"),
});

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>;
export type UpdateTransactionSchemaType = z.infer<
  typeof updateTransactionSchema
>;
export type DeleteTransactionsByIdsSchemaType = z.infer<
  typeof deleteTransactionsByIdsSchema
>;
