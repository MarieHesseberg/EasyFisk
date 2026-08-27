import { Icon } from "@/components/ui/icon";

export function CheckRow({
  title,
  sub,
  state = "ok",
}: {
  title: string;
  sub: string;
  state?: "ok" | "warning" | "error";
}) {
  return (
    <div className={"check-row " + state}>
      <span>{state === "ok" ? <Icon name="check" size={16} /> : "!"}</span>
      <p>
        <b>{title}</b>
        <small>{sub}</small>
      </p>
    </div>
  );
}
