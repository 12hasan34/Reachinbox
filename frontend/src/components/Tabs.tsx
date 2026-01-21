export type TabItem = {
  key: string;
  label: string;
};

type Props = {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

export default function Tabs({ items, activeKey, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {items.map((t) => {
        const active = t.key === activeKey;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
