import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import Tabs from "../components/Tabs";
import Table from "../components/Table";
import Button from "../components/Button";
import ComposeEmailModal from "../components/ComposeEmailModal";
import { getScheduledEmails, getSentEmails } from "../api/email.api";
import type { ScheduledEmail, SentEmail } from "../api/types";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [composeOpen, setComposeOpen] = useState(false);

  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [sent, setSent] = useState<SentEmail[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs = useMemo(
    () => [
      { key: "scheduled", label: "Scheduled Emails" },
      { key: "sent", label: "Sent Emails" }
    ],
    []
  );

  const refresh = async () => {
    setError(null);
    setLoading(true);

    try {
      const [scheduledRes, sentRes] = await Promise.all([
        getScheduledEmails(),
        getSentEmails()
      ]);
      setScheduled(scheduledRes.data);
      setSent(sentRes.data);
    } catch {
      setError("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => setSuccess(null), 2500);
    return () => window.clearTimeout(t);
  }, [success]);

  useEffect(() => {
    void refresh();
  }, []);

  const scheduledColumns = useMemo(
    () => [
      {
        header: "Email address",
        render: (r: ScheduledEmail) => r.recipient_email
      },
      {
        header: "Subject",
        render: (r: ScheduledEmail) => r.subject
      },
      {
        header: "Scheduled time",
        render: (r: ScheduledEmail) => {
          try {
            // scheduled_at is in UTC ISO format from backend
            const date = new Date(r.scheduled_at);
            return date.toLocaleString();
          } catch {
            return "Invalid Date";
          }
        }
      },
      {
        header: "Status",
        render: (r: ScheduledEmail) => (
          <span className="inline-flex rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
            {r.status}
          </span>
        )
      }
    ],
    []
  );

  const sentColumns = useMemo(
    () => [
      {
        header: "Email address",
        render: (r: SentEmail) => r.recipient_email
      },
      {
        header: "Subject",
        render: (r: SentEmail) => r.subject
      },
      {
        header: "Sent time",
        render: (r: SentEmail) => {
          try {
            // sent_at is in UTC ISO format from backend
            const date = new Date(r.sent_at);
            return date.toLocaleString();
          } catch {
            return "Invalid Date";
          }
        }
      },
      {
        header: "Status",
        render: (r: SentEmail) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              r.status === "sent"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {r.status}
          </span>
        )
      }
    ],
    []
  );

  return (
    <div className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            items={tabs}
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as "scheduled" | "sent")}
          />

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={refresh} loading={loading}>
              Refresh
            </Button>
            <Button onClick={() => setComposeOpen(true)}>Compose New Email</Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              Loading...
            </div>
          ) : activeTab === "scheduled" ? (
            scheduled.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
                No scheduled emails.
              </div>
            ) : (
              <Table
                rows={scheduled}
                columns={scheduledColumns}
                keyFn={(r) => r.id}
              />
            )
          ) : sent.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
              No sent emails yet.
            </div>
          ) : (
            <Table rows={sent} columns={sentColumns} keyFn={(r) => r.id} />
          )}
        </div>
      </div>

      <ComposeEmailModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSuccess={() => {
          setSuccess("Emails scheduled successfully");
          void refresh();
        }}
      />
    </div>
  );
}