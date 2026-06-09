import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  variant?: "filled" | "outline";
  className?: string;
}

export function Chip({ children, variant = "filled", className }: ChipProps) {
  return (
    <span
      className={cn(
        "chip",
        variant === "outline" && "chip-outline",
        className
      )}
    >
      {children}
    </span>
  );
}
