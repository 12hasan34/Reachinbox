import { useState } from "react";
import { scheduleEmails } from "../api/emails";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComposeEmailModal({ isOpen, onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emails, setEmails] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Compose New Email</h2>

        <div className="space-y-4">
          <input
            className="w-full border p-2 rounded"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            placeholder="Email body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            placeholder="Emails (comma separated)"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>

          <button
  className="px-4 py-2 rounded bg-green-600 text-white"
  onClick={async () => {
    await scheduleEmails({
      subject,
      body,
      emails: emails.split(",").map(e => e.trim()),
      startTime: new Date().toISOString(),
      delay: 2,
    });
    onClose();
  }}
>
  Schedule
</button>

        </div>
      </div>
    </div>
  );
}
