import { startJobs } from "./scheduler";

export const initializeCrons = async () => {
  try {
    const jobs = startJobs();

    console.log(`${jobs.length} cron jobs running`);

    return jobs;
  } catch (error) {
    console.error("Error starting cron jobs:", error);
    return [];
  }
};
