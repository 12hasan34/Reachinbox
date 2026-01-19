import { db } from "../db/mysql";
import { scheduleEmailJob } from "../queue/email.queue";

async function rebuildQueue() {
  const [rows]: any = await db.query(
    "SELECT id, scheduled_at FROM emails WHERE status='pending'"
  );

  for (const email of rows) {
    const delay = new Date(email.scheduled_at).getTime() - Date.now();

    if (delay > 0) {
      await scheduleEmailJob(email.id, delay);
    }
  }

  console.log("Queue rebuilt successfully");
  process.exit(0);
}

rebuildQueue();