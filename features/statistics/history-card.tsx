import { Icon } from "@/components/ui/icon";

export function History({
  day,
  title,
  time,
  result,
}: {
  day: string;
  title: string;
  time: string;
  result: string;
}) {
  return (
    <div className="history-card">
      <div className="date-box">
        <b>{day}</b>
        <small>JUN</small>
      </div>
      <div>
        <b>{title}</b>
        <small>{time}</small>
        <span>{result}</span>
      </div>
      <Icon name="chevron" />
    </div>
  );
}
