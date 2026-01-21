import api from "./axios";
import type {
  ScheduleEmailRequest,
  ScheduleEmailResponse,
  ScheduledEmail,
  SentEmail
} from "./types";

export async function scheduleEmails(payload: ScheduleEmailRequest) {
  return api.post<ScheduleEmailResponse>("/emails/schedule", payload);
}

export async function getScheduledEmails() {
  return api.get<ScheduledEmail[]>("/emails/scheduled");
}

export async function getSentEmails() {
  return api.get<SentEmail[]>("/emails/sent");
}
