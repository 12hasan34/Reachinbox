import { emailQueue } from "../config/bullmq";

export async function scheduleEmailJob(emailId: number, delayMs: number) {
  await emailQueue.add(
    "send-email",
    { emailId },
    {
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    }
  );
}
