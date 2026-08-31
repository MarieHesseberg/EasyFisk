import type { PrototypePermitSeller } from "@/domain/fishing-permits/prototype-permit-product";

export function PermitSellerContact({ seller }: { seller: PrototypePermitSeller }) {
  const phoneHref = `tel:${seller.phone.replaceAll(/[^+\d]/g, "")}`;
  return (
    <section className="permit-seller-contact" aria-labelledby="permit-seller-title">
      <h3 id="permit-seller-title">Kontakt selger</h3>
      <b>{seller.organization}</b>
      <span>{seller.contactName}</span>
      <div>
        <a href={phoneHref}>Ring {seller.phone}</a>
        <a href={`mailto:${seller.email}`}>Send e-post</a>
      </div>
      <small>Kontaktinformasjon kontrollert mot den offentlige Inatur-siden.</small>
    </section>
  );
}
