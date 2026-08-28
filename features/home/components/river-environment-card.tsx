import { Icon } from "@/components/ui/icon";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
export function RiverEnvironmentCard({
  demoStatus,
  station,
  temperature,
  measuredHotTemperature,
  closureTemperature,
  flow,
  zone,
}: {
  demoStatus: DemoStatus;
  station: string;
  temperature: number;
  measuredHotTemperature: number;
  closureTemperature: number;
  flow: number;
  zone: string;
}) {
  const isAlert = ["hotWater", "closed"].includes(demoStatus);
  return (
    <section className={`notice ${isAlert ? "error" : ""}`}>
      <div className="notice-icon">
        <Icon name="leaf" />
      </div>
      <div>
        <small>EKSEMPELDATA · {station.toUpperCase()}</small>
        <h3>
          {demoStatus === "hotWater"
            ? `Vanntemperatur ${String(measuredHotTemperature).replace(".", ",")} °C`
            : demoStatus === "closed"
              ? `${zone} er stengt`
              : `Vannføring ${flow} m³/s`}
        </h3>
        <p>
          {demoStatus === "hotWater"
            ? "Alt fiske er midlertidig stanset"
            : demoStatus === "closed"
              ? "Aktivt stengningsvarsel · se åpne soner"
              : `Vanntemperatur ${temperature} °C · stans ved over ${closureTemperature} °C`}
        </p>
      </div>
      <span className="trend">→</span>
    </section>
  );
}
