import cron from "node-cron";

import { processRecurringTransactions } from "./jobs/transaction.job";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling job ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();

        console.log(`Job ${name} completed`);
      } catch (error) {
        console.error(`Job ${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  );
};

export const startJobs = () => {
  return [
    scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),
  ];
};
