import { Router } from "express";
import { db } from "../db/mysql";
import { scheduleEmailJob } from "../queue/email.queue";
import { v4 as uuid } from "uuid";
import { env } from "../config/env";

const router = Router();

router.post("/schedule", async (req, res) => {
  const { subject, body, emails, startTime, delay } = req.body;

  if (!subject || !body || !startTime || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: "Invalid schedule payload" });
  }

  const delaySeconds = Number(delay);
  if (!Number.isFinite(delaySeconds) || delaySeconds <= 0) {
    return res.status(400).json({ message: "Invalid delay" });
  }

  const minDelaySeconds = Math.ceil(env.EMAIL_MIN_DELAY_MS / 1000);
  if (delaySeconds < minDelaySeconds) {
    return res.status(400).json({
      message: `Delay must be at least ${minDelaySeconds} seconds`
    });
  }

  // Format datetime for MySQL (YYYY-MM-DD HH:MM:SS)
  // startTime is ISO 8601 UTC string from frontend
  // Extract the datetime part and convert to MySQL format
  const startTimeFormatted = startTime.substring(0, 19).replace('T', ' ');

  const [campaignResult]: any = await db.query(
    "INSERT INTO email_campaigns(subject, body, start_time, delay_between_emails) VALUES (?, ?, ?, ?)",
    [subject, body, startTimeFormatted, delaySeconds]
  );

  const campaignId = campaignResult.insertId;
  // Parse the UTC time string to get milliseconds for calculating subsequent email times
  const startDate = new Date(startTime);
  let currentTime = startDate.getTime();

  for (const email of emails) {
    // Format scheduled_at datetime for MySQL (YYYY-MM-DD HH:MM:SS)
    const scheduledAtFormatted = new Date(currentTime).toISOString().slice(0, 19).replace('T', ' ');
    
    const [result]: any = await db.query(
      "INSERT INTO emails(campaign_id, recipient_email, scheduled_at, unique_key) VALUES (?, ?, ?, ?)",
      [campaignId, email, scheduledAtFormatted, uuid()]
    );

    await scheduleEmailJob(
      result.insertId,
      Math.max(0, currentTime - Date.now())
    );

    currentTime += delaySeconds * 1000;
  }

  res.json({ success: true });
});

router.get("/scheduled", async (_, res) => {
  const [rows]: any = await db.query(
    "SELECT e.id, e.recipient_email, " +
      "DATE_FORMAT(CONVERT_TZ(e.scheduled_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') as scheduled_at, " +
      "e.status, c.subject " +
      "FROM emails e " +
      "JOIN email_campaigns c ON c.id = e.campaign_id " +
      "WHERE e.status='pending' " +
      "ORDER BY e.scheduled_at ASC"
  );

  res.json(rows);
});

router.get("/sent", async (_, res) => {
  const [rows]: any = await db.query(
    "SELECT e.id, e.recipient_email, " +
      "DATE_FORMAT(CONVERT_TZ(e.sent_at, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%sZ') as sent_at, " +
      "e.status, c.subject " +
      "FROM emails e " +
      "JOIN email_campaigns c ON c.id = e.campaign_id " +
      "WHERE e.status IN ('sent','failed') " +
      "ORDER BY e.sent_at DESC"
  );

  res.json(rows);
});

export default router;