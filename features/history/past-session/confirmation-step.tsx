import { Icon } from "@/components/ui/icon";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";

export function ConfirmationStep({
  controller,
  onClose,
}: {
  controller: PastSessionController;
  onClose: () => void;
}) {
  const { from, reports, start, to } = controller.state;
  return (
    <>
      <div className="sent-icon">
        <Icon name="check" size={32} />
      </div>
      <small>ETTERREGISTRERINGEN ER SENDT</small>
      <h2>Tur og fangster er registrert</h2>
      <p className="sent-lead">
        Den tidligere fisketuren er lagt til i historikken. Alle fangster er merket som
        etterregistrert.
      </p>
      <div className="report-id">
        <small>ØKT</small>
        <b>
          {new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "long" }).format(
            new Date(start),
          )}{" "}
          · {from}–{to}
        </b>
      </div>
      {reports.map((x, i) => (
        <div className="report-id" key={x.id}>
          <small>RAPPORT-ID · FANGST {i + 1}</small>
          <b>{x.id}</b>
        </div>
      ))}
      <button className="primary" onClick={onClose}>
        Åpne historikken
      </button>
    </>
  );
}
