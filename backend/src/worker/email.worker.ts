import { Worker } from "bullmq";
import { redisConnection } from "../config/connection";
import { db } from "../db/mysql";
import { createTransporter } from "../utils/mailer";
import { env } from "../config/env";

new Worker(
  "email-queue",
  async (job) => {
    const { emailId } = job.data;

    const [rows]: any = await db.query(
      "SELECT * FROM emails WHERE id = ?",
      [emailId]
    );

    const email = rows[0];
    if (!email || email.status === "sent") return;

    // Rate limiting (hour window)
    const hourKey = `rate:${new Date().toISOString().slice(0, 13)}`;

    // BullMQ-safe Redis access via job.connection is NOT provided,
    // so we will use a lightweight ioredis ONLY for counters
    const Redis = require("ioredis");
    const redis = new Redis(redisConnection);

    const count = await redis.incr(hourKey);
    await redis.expire(hourKey, 3600);

    if (count > env.MAX_EMAILS_PER_HOUR) {
      throw new Error("Rate limit exceeded");
    }

    const transporter = await createTransporter();
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
  },
  {
    connection: redisConnection,
    concurrency: 2
  }
);