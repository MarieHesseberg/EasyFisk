import { selectLocalized } from "@/locales";
import type { PrototypePermitSeller } from "@/domain/fishing-permits/prototype-permit-product";
import { useLanguage } from "@/components/localization/language-provider";
export function PermitSellerContact({ seller }: { seller: PrototypePermitSeller }) {
  const { language, t } = useLanguage();
  const phoneHref = `tel:${seller.phone.replaceAll(/[^+\d]/g, "")}`;
  return (
    <section className="permit-seller-contact" aria-labelledby="permit-seller-title">
      <h3 id="permit-seller-title">{t("copy.kontakt.selger.b199545")}</h3>
      <b>{seller.organization}</b>
      <span>{seller.contactName}</span>
      <div>
        <a href={phoneHref}>
          {selectLocalized(language, "Ring", "Call")} {seller.phone}
        </a>
        <a href={`mailto:${seller.email}`}>
          {selectLocalized(language, "Send e-post", "Send email")}
        </a>
      </div>
      <small>{t("copy.kontaktinformasjon.kontrollert.mot.den.offentlig.85e0913")}</small>
    </section>
  );
}
