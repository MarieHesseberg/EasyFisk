import { Icon } from "@/components/ui/icon";

export function HomeActionRow({
  icon,
  title,
  detail,
  tone,
  className = "",
  onClick,
}: {
  icon: string;
  title: string;
  detail?: string;
  tone?: "sage" | "gray";
  className?: string;
  onClick: () => void;
}) {
  return (
    <button className={`home-action-row ${className}`} onClick={onClick}>
      <span className={`home-shortcut-icon ${tone ?? ""}`}>
        <Icon name={icon} size={25} />
      </span>
      <span className="home-shortcut-copy">
        <b>{title}</b>
        {detail && <small>{detail}</small>}
      </span>
      <Icon name="chevron" size={18} />
    </button>
  );
}
