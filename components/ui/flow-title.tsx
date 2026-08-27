import { Icon } from "@/components/ui/icon";

export function FlowTitle({
  icon,
  eyebrow,
  title,
  text,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flow-title">
      <span>
        <Icon name={icon} size={27} />
      </span>
      <small>{eyebrow}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
