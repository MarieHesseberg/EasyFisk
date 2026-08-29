import { Icon } from "@/components/ui/icon";

export function FishingHistoryCard({
  day,
  month,
  onClick,
  title,
  time,
  result,
}: {
  day: string;
  month: string;
  onClick: () => void;
  title: string;
  time: string;
  result: string;
}) {
  return (
    <button className="history-card" onClick={onClick}>
      <div className="date-box">
        <b>{day}</b>
        <small>{month}</small>
      </div>
      <div>
        <b>{title}</b>
        <small>{time}</small>
        <span>{result}</span>
      </div>
      <Icon name="chevron" />
    </button>
  );
}
