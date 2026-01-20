import { useState } from "react";
import ComposeEmailModal from "../components/ComposeEmailModal";
import Layout from "../components/Layout";
import ScheduledEmailsTable from "../components/ScheduledEmailsTable";
import SentEmailsTable from "../components/SentEmailsTable";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
  const [showCompose, setShowCompose] = useState(false);

  return (
    <Layout>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("scheduled")}
          className={`px-4 py-2 rounded ${
            activeTab === "scheduled"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Scheduled Emails
        </button>

        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2 rounded ${
            activeTab === "sent"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Sent Emails
        </button>

        <button
          onClick={() => setShowCompose(true)}
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded"
        >
          Compose New Email
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        {activeTab === "scheduled" ? (
          <ScheduledEmailsTable />
        ) : (
          <SentEmailsTable />
        )}
      </div>

      <ComposeEmailModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
      />
    </Layout>
  );
}
