import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  children
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
          <div className="flex items-start justify-between gap-4 border-b p-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">{title}</div>
              {description ? (
                <div className="mt-1 text-sm text-gray-600">{description}</div>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
