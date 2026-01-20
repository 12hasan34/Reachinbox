import { api } from "./client";

export interface ScheduleEmailPayload {
  subject: string;
  body: string;
  emails: string[];
  startTime: string;
  delay: number;
}

export interface ScheduledEmail {
  id: number;
  email: string;
  subject: string;
  scheduled_time: string;
  status: string;
}

export function scheduleEmails(data: ScheduleEmailPayload) {
  return api("/emails/schedule", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getScheduledEmails() {
  return api<ScheduledEmail[]>("/emails/scheduled");
}

export function getSentEmails() {
  return api<ScheduledEmail[]>("/emails/sent");
}
