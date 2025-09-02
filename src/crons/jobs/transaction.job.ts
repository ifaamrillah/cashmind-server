import mongoose from "mongoose";

import TransactionModel from "../../models/transaction.model";

import { calculateNextOccurrence } from "../../utils/helper";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processedCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: {
        $lte: now,
      },
    }).cursor();

    console.log("Starting recurring process");

    for await (const trx of transactionCursor) {
      const nextDate = calculateNextOccurrence(
        trx.nextRecurringDate!,
        trx.recurringInterval!
      );

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(
          async () => {
            await TransactionModel.create([
              {
                ...trx.toObject(),
                _id: new mongoose.Types.ObjectId(),
                title: `Recurring - ${trx.title}`,
                date: trx.nextRecurringDate,
                isRecurring: false,
                nextRecurringDate: null,
                recurringInterval: null,
                lastProcessed: null,
              },
              { session },
            ]);

            await TransactionModel.updateOne(
              {
                _id: trx._id,
              },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processedCount++;
      } catch (error: any) {
        failedCount++;
        console.log(`Failed recurring transaction: ${trx._id}`, error?.message);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processedCount} transactions`);
    console.log(`❌ Failed: ${failedCount} transactions`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error: any) {
    console.error("Error occur processing transaction", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};
