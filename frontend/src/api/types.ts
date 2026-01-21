export type EmailStatus = "pending" | "sent" | "failed";

export interface ScheduledEmail {
  id: number;
  recipient_email: string;
  subject: string;
  scheduled_at: string;
  status: EmailStatus;
}

export interface SentEmail {
  id: number;
  recipient_email: string;
  subject: string;
  sent_at: string;
  status: Exclude<EmailStatus, "pending">;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
  };
}

export interface ScheduleEmailRequest {
  subject: string;
  body: string;
  emails: string[];
  startTime: string;
  delay: number;
}

export interface ScheduleEmailResponse {
  success: boolean;
}
