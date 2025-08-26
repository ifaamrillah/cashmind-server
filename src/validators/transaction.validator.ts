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

export const createTransactionsSchema = z.object({
  transactions: z
    .array(baseTransactionSchema)
    .min(1, "At least one transaction is required")
    .max(300, "Maximum of 300 transactions are allowed")
    .refine(
      (trxs) =>
        trxs.every((trx) => {
          const amount = Number(trx.amount);
          return !isNaN(amount) && amount > 0 && amount <= 1_000_000_000;
        }),
      {
        message:
          "Amount must be greater than 0 and less than or equal to 1,000,000,000",
      }
    ),
});

export const updateTransactionSchema = baseTransactionSchema.partial();

export const deleteTransactionsByIdsSchema = z.object({
  transactionsIds: z
    .array(z.string().length(24, "Invalid transaction id"))
    .min(1, "At least one transaction id is required"),
});

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>;

export type UpdateTransactionSchemaType = z.infer<
  typeof updateTransactionSchema
>;
