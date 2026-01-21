import { useMemo, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Modal from "./Modal";
import { scheduleEmails } from "../api/email.api";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractEmailsFromText(text: string) {
  const candidates = text
    .split(/[\s,;\n\r\t]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const unique = new Set<string>();
  for (const c of candidates) {
    unique.add(c);
  }

  return Array.from(unique);
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ComposeEmailModal({ open, onClose, onSuccess }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delaySeconds, setDelaySeconds] = useState<number>(10);
  const [hourlyLimit, setHourlyLimit] = useState<number>(20);

  const [emails, setEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveDelaySeconds = useMemo(() => {
    const safeHourly = Number.isFinite(hourlyLimit) && hourlyLimit > 0 ? hourlyLimit : 1;
    const minDelay = Math.ceil(3600 / safeHourly);
    return Math.max(delaySeconds || 0, minDelay);
  }, [delaySeconds, hourlyLimit]);

  const handleFile = async (file: File) => {
    setError(null);
    const text = await file.text();
    const extracted = extractEmailsFromText(text);

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const e of extracted) {
      if (isValidEmail(e)) valid.push(e);
      else invalid.push(e);
    }

    setEmails(valid);
    setInvalidEmails(invalid);
  };

  const reset = () => {
    setSubject("");
    setBody("");
    setStartTime("");
    setDelaySeconds(10);
    setHourlyLimit(20);
    setEmails([]);
    setInvalidEmails([]);
    setError(null);
    setSubmitting(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setError(null);

    if (!subject.trim()) return setError("Subject is required");
    if (!body.trim()) return setError("Body is required");
    if (!startTime) return setError("Start time is required");
    if (emails.length === 0) return setError("Please upload a file with at least 1 valid email");

    const dt = new Date(startTime);
    if (Number.isNaN(dt.getTime())) return setError("Invalid start time");

    try {
      setSubmitting(true);
      
      // Convert local datetime to UTC
      const localDate = new Date(startTime);
      const utcString = localDate.toISOString();
      
      await scheduleEmails({
        subject,
        body,
        emails,
        startTime: utcString,
        delay: effectiveDelaySeconds
      });

      onSuccess();
      close();
    } catch (e) {
      setError("Failed to schedule emails");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Compose New Email"
      description="Upload a CSV/text file of recipients, set schedule, and queue emails."
      onClose={close}
    >
      <div className="space-y-4">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Campaign subject"
          />
          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <label className="block">
          <div className="mb-1 text-sm font-medium text-gray-700">Body</div>
          <textarea
            className="h-28 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write email body..."
          />
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Delay Between Emails (seconds)"
            type="number"
            min={1}
            value={String(delaySeconds)}
            onChange={(e) => setDelaySeconds(Number(e.target.value))}
          />
          <Input
            label="Hourly Limit (emails/hour)"
            type="number"
            min={1}
            value={String(hourlyLimit)}
            onChange={(e) => setHourlyLimit(Number(e.target.value))}
          />
        </div>

        <div className="text-xs text-gray-600">
          Effective delay used for scheduling: <span className="font-semibold">{effectiveDelaySeconds}s</span>
        </div>

        <label className="block">
          <div className="mb-1 text-sm font-medium text-gray-700">Recipients File (CSV or text)</div>
          <input
            type="file"
            accept=".csv,.txt,text/plain,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black"
          />
          <div className="mt-2 text-sm text-gray-700">
            Detected valid emails: <span className="font-semibold">{emails.length}</span>
            {invalidEmails.length ? (
              <span className="text-red-600"> (invalid: {invalidEmails.length})</span>
            ) : null}
          </div>
        </label>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting}>
            Schedule
          </Button>
        </div>
      </div>
    </Modal>
  );
}
