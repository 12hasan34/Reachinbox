import { Router } from "express";
import { db } from "../db/mysql";
import { scheduleEmailJob } from "../queue/email.queue";
import { v4 as uuid } from "uuid";

const router = Router();

router.post("/schedule", async (req, res) => {
  const { subject, body, emails, startTime, delay } = req.body;

  const [campaignResult]: any = await db.query(
    "INSERT INTO email_campaigns(subject, body, start_time, delay_between_emails) VALUES (?, ?, ?, ?)",
    [subject, body, startTime, delay]
  );

  const campaignId = campaignResult.insertId;
  let currentTime = new Date(startTime).getTime();

  for (const email of emails) {
    const [result]: any = await db.query(
      "INSERT INTO emails(campaign_id, recipient_email, scheduled_at, unique_key) VALUES (?, ?, ?, ?)",
      [campaignId, email, new Date(currentTime), uuid()]
    );

    await scheduleEmailJob(
      result.insertId,
      currentTime - Date.now()
    );

    currentTime += delay * 1000;
  }

  res.json({ success: true });
});

router.get("/scheduled", async (_, res) => {
  const [rows] = await db.query(
    "SELECT * FROM emails WHERE status='pending' ORDER BY scheduled_at ASC"
  );

  res.json(rows);
});

router.get("/sent", async (_, res) => {
  const [rows] = await db.query(
    "SELECT * FROM emails WHERE status IN ('sent','failed') ORDER BY sent_at DESC"
  );

  res.json(rows);
});

export default router;