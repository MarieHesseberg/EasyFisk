import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";

export function PositionStep({ back, next }: { back: () => void; next: () => void }) {
  return (
    <>
      <FlowTitle
        icon="pin"
        eyebrow="POSISJON"
        title="Finn riktig fiskesone"
        text="Posisjonen brukes én gang for å foreslå sone. Kontinuerlig sporing er ikke nødvendig."
      />
      <div className="permission-card">
        <Icon name="pin" size={30} />
        <b>Tillat posisjon når du starter</b>
        <p>EasyFisk lagrer bare sone og valgfri startposisjon sammen med økten.</p>
      </div>
      <button className="primary" onClick={next}>
        Tillat og finn sone
      </button>
      <button className="secondary" onClick={next}>
        Velg sone manuelt
      </button>
      <button className="text-button" onClick={back}>
        Tilbake
      </button>
    </>
  );
}
