import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  left?: ReactNode;
};

function variantClass(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50";
    case "danger":
      return "bg-red-600 text-white hover:bg-red-700";
    case "primary":
    default:
      return "bg-gray-900 text-white hover:bg-black";
  }
}

export default function Button({
  variant = "primary",
  loading,
  left,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass(
        variant
      )} ${className || ""}`}
      {...rest}
    >
      {left}
      {loading ? "Please wait..." : children}
    </button>
  );
}
