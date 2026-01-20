import { useEffect, useState } from "react";
import type { ScheduledEmail } from "../api/emails";
import { getScheduledEmails } from "../api/emails";

export default function ScheduledEmailsTable() {
  const [data, setData] = useState<ScheduledEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getScheduledEmails()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading scheduled emails...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data.length) return <div>No scheduled emails</div>;

  return (
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Email</th>
          <th className="p-2 border">Subject</th>
          <th className="p-2 border">Time</th>
          <th className="p-2 border">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e) => (
          <tr key={e.id}>
            <td className="p-2 border">{e.email}</td>
            <td className="p-2 border">{e.subject}</td>
            <td className="p-2 border">{e.scheduled_time}</td>
            <td className="p-2 border">{e.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
