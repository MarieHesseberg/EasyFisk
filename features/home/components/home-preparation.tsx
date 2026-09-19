import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { DetailDestination } from "@/domain/navigation/navigation";

export function HomePreparation({
  documentReadiness,
  onDocument,
}: {
  documentReadiness: DocumentReadiness;
  onDocument: (destination: DetailDestination) => void;
}) {
  const { language } = useLanguage();
  return (
    <>
      <h2>{selectLocalized(language, "Før du drar", "Before you go")}</h2>
      {(
        [
          {
            kind: "disinfection",
            icon: "drop",
            heading: selectLocalized(language, "Desinfisering", "Disinfection"),
            label: selectLocalized(language, "Registrer desinfisering", "Register disinfection"),
            saved: selectLocalized(language, "Desinfisering registrert", "Disinfection registered"),
          },
          {
            kind: "fee",
            icon: "document",
            heading: selectLocalized(language, "Statlig fiskeravgift", "National fishing fee"),
            label: selectLocalized(
              language,
              "Registrer statlig fiskeravgift",
              "Register national fishing fee",
            ),
            saved: selectLocalized(
              language,
              "Statlig fiskeravgift registrert",
              "National fishing fee registered",
            ),
          },
        ] as const
      ).map((item) => (
        <button
          key={item.kind}
          className={`home-preparation-row preparation-${item.kind}${documentReadiness.valid[item.kind] ? " document-ready" : ""}`}
          aria-label={documentReadiness.valid[item.kind] ? item.saved : item.label}
          onClick={() => onDocument(item.kind)}
        >
          <span className="home-shortcut-icon">
            <Icon name={item.icon} size={25} />
          </span>
          <span className="home-shortcut-copy">
            <b>{item.heading}</b>
            <small>
              {documentReadiness.valid[item.kind] ? (
                <>
                  <Icon name="check" size={16} />{" "}
                  {selectLocalized(language, "Registrert", "Registered")}
                </>
              ) : (
                selectLocalized(language, "Registrer", "Register")
              )}
            </small>
          </span>
          <Icon name="chevron" size={18} />
        </button>
      ))}
    </>
  );
}
