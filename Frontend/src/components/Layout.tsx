export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>ReachInbox Scheduler</h1>
      {children}
    </div>
  );
}
