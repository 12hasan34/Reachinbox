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
      "SELECT e.id, e.recipient_email, e.status, c.subject, c.body " +
        "FROM emails e " +
        "JOIN email_campaigns c ON c.id = e.campaign_id " +
        "WHERE e.id = ?",
      [emailId]
    );

    const email: {
      id: number;
      recipient_email: string;
      status: string;
      subject: string;
      body: string;
    } | undefined = rows[0];
    if (!email) return;

    // 🛑 Idempotency guard
    if (email.status === "sent") return;

    const hourKey = `email_rate:${env.SENDER_EMAIL}:${new Date()
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

    try {
      await transporter.sendMail({
        from: env.SENDER_EMAIL,
        to: email.recipient_email,
        subject: email.subject,
        text: email.body
      });

      await db.query(
        "UPDATE emails SET status='sent', sent_at=NOW() WHERE id=?",
        [emailId]
      );
    } catch (err) {
      const attempts = job.opts.attempts ?? 1;
      const nextAttempt = job.attemptsMade + 1;

      if (nextAttempt >= attempts) {
        await db.query(
          "UPDATE emails SET status='failed', sent_at=NOW() WHERE id=?",
          [emailId]
        );
      }
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3
  }
);