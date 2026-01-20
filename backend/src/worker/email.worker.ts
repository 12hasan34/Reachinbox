import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { rateLimitRedis } from "../config/rateLimit.redis";
import { db } from "../db/mysql";
import { createTransporter } from "../utils/mailer";
import { env } from "../config/env";
import { getNextHourTimestamp } from "../utils/time";
import { emailQueue } from "../config/bullmq";

new Worker(
  "email-queue",
  async (job) => {
    const { emailId } = job.data;

    const [rows]: any = await db.query(
      "SELECT * FROM emails WHERE id = ?",
      [emailId]
    );

    const email = rows[0];
    if (!email) return;

    // ✅ Idempotency guard
    if (email.status === "sent") return;

    const sender = "global"; // later can be per sender
    const hourKey = `rate:${sender}:${new Date().toISOString().slice(0, 13)}`;

    const currentCount = await rateLimitRedis.incr(hourKey);
await rateLimitRedis.expire(hourKey, 3600);


    // 🚦 Rate limit exceeded → RESCHEDULE
    if (currentCount > env.MAX_EMAILS_PER_HOUR) {
      const nextHour = getNextHourTimestamp();
      const delay = nextHour - Date.now();

      console.log(`Rate limit hit. Rescheduling email ${emailId}`);

      await emailQueue.add(
        "send-email",
        { emailId },
        { delay }
      );

      return;
    }

    const transporter = await createTransporter();

    try {
      await transporter.sendMail({
        from: "no-reply@reachinbox.io",
        to: email.recipient_email,
        subject: "Scheduled Email",
        text: "Hello from ReachInbox"
      });

      await db.query(
        "UPDATE emails SET status='sent', sent_at=NOW() WHERE id=?",
        [emailId]
      );
    } catch (err: any) {
      await db.query(
        "UPDATE emails SET status='failed', last_error=? WHERE id=?",
        [err.message, emailId]
      );
      throw err;
    }
  },
 {
  connection: redisConnection,
  concurrency: 2
}
);
