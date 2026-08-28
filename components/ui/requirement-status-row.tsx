import { Icon } from "@/components/ui/icon";

export function RequirementStatusRow({
  icon,
  title,
  sub,
  quota,
  state = "ok",
}: {
  icon: string;
  title: string;
  sub: string;
  quota?: boolean;
  state?: "ok" | "warning" | "error";
}) {
  return (
    <div className={"home-status " + state}>
      <span>
        <Icon name={icon} />
      </span>
      <p>
        <b>{title}</b>
        <small>{sub}</small>
      </p>
      {state !== "ok" ? <i>!</i> : quota ? <strong>4</strong> : <Icon name="check" size={18} />}
    </div>
  );
}
