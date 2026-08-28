import { Icon } from "@/components/ui/icon";

export function CheckRow({
  title,
  sub,
  state = "ok",
}: {
  title: string;
  sub: string;
  state?: "ok" | "warning" | "error" | "unavailable";
}) {
  return (
    <div className={"check-row " + state}>
      <span aria-hidden="true">
        {state === "ok" ? <Icon name="check" size={16} /> : state === "unavailable" ? "?" : "!"}
      </span>
      <p>
        <b>{title}</b>
        <small>{sub}</small>
      </p>
    </div>
  );
}
