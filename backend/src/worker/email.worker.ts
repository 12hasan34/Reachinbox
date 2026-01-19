import { Worker } from "bullmq";
import { redisConnection } from "../config/connection";
import { db } from "../db/mysql";
import { createTransporter } from "../utils/mailer";
import { env } from "../config/env";
import { getDelayUntilNextHour } from "../utils/time";
import Redis from "ioredis";

const redis = new Redis(redisConnection);

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

    // 🛑 Idempotency guard
    if (email.status === "sent") return;

    const hourKey = `email_rate:${email.sender_email}:${new Date()
      .toISOString()
      .slice(0, 13)}`;

    const count = await redis.incr(hourKey);
    await redis.expire(hourKey, 3600);

    // 🚦 Rate limit hit → reschedule
    if (count > env.MAX_EMAILS_PER_HOUR) {
      const delay = getDelayUntilNextHour();

      await job.moveToDelayed(Date.now() + delay);
      return;
    }

    const transporter = await createTransporter();

    await transporter.sendMail({
      from: email.sender_email,
      to: email.recipient_email,
      subject: email.subject,
      text: email.body
    });

    await db.query(
      "UPDATE emails SET status='sent', sent_at=NOW() WHERE id=?",
      [emailId]
    );
  },
  {
    connection: redisConnection,
    concurrency: 3
  }
);