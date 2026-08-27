import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/models";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { formatLongDuration } from "@/lib/time";

export function CatchConfirmationStep({
  catches,
  controller,
  finishAfterCatch,
  onDone,
}: {
  catches: CatchRecord[];
  controller: CatchReportController;
  finishAfterCatch: boolean;
  onDone: () => void;
}) {
  const { result, sentCatch, validation } = controller.state;

  return (
    <>
      <div className="sent-icon">
        <Icon name="check" size={32} />
      </div>
      <small>STEG 4 AV 4 · SENDT</small>
      <h2>Fangstrapporten er sendt</h2>
      <p className="sent-lead">
        {sentCatch?.late
          ? `Rapporten ble sendt ${formatLongDuration(Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))} etter fangsten og er merket som forsinket.`
          : `Rapporten ble sendt ${sentCatch ? formatLongDuration(Math.max(0, Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))) : "kort tid"} etter fangsten og innen fristen på 2 timer.`}
      </p>
      {sentCatch?.late && (
        <div className="violation-sent late">
          <b>Forsinket fangstrapport</b>
          <p>
            Det faktiske fangsttidspunktet er beholdt, og innsendingstidspunktet er registrert
            separat.
          </p>
        </div>
      )}
      {validation.blocked && (
        <div className="violation-sent">
          <b>Rapportert regelavvik</b>
          <p>
            Fangsten er registrert som avlivet. Rapporten er merket for mulig oppfølging fordi
            størrelsen er utenfor tillatt grense.
          </p>
        </div>
      )}
      <div className="quota-update">
        <h3>Oppdatert kvotestatus</h3>
        <div>
          <span>Døgnkvote</span>
          <b>{result === "Avlivet" ? "0 av 1 gjenstår" : "1 av 1 gjenstår"}</b>
        </div>
        <div>
          <span>Sesongkvote laks</span>
          <b>
            {Math.max(
              0,
              4 -
                catches.filter((item) => item.species === "Laks" && item.result === "Avlivet")
                  .length,
            )}{" "}
            av 5 gjenstår
          </b>
        </div>
      </div>
      {validation.largeSalmon && (
        <div className="large-salmon-used">
          <b>Storlaks-unntaket er brukt</b>
          <span>0 av 1 gjenstår</span>
        </div>
      )}
      <div className="report-id">
        <small>RAPPORT-ID</small>
        <b>{sentCatch?.id || "Oppretter rapport-ID"}</b>
      </div>
      <button className="primary" onClick={onDone}>
        {finishAfterCatch ? "Se sammendrag for økten" : "Ferdig"}
      </button>
    </>
  );
}
