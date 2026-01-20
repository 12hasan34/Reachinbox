export default function SentEmailsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left border">Email</th>
            <th className="p-3 text-left border">Subject</th>
            <th className="p-3 text-left border">Sent Time</th>
            <th className="p-3 text-left border">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border">test@example.com</td>
            <td className="p-3 border">Welcome</td>
            <td className="p-3 border">2026-01-20 18:30</td>
            <td className="p-3 border text-green-600">Sent</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
