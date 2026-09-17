import { useLanguage } from "@/components/localization/language-provider";
import { Icon } from "@/components/ui/icon";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import {
  getPermitPriceSummary,
  type PermitCheckoutForm,
} from "@/domain/fishing-permits/permit-purchase";

export function PermitVippsPayment({
  product,
  form,
  isSubmitting,
  approve,
  cancel,
}: {
  product: PrototypePermitProduct;
  form: PermitCheckoutForm;
  isSubmitting: boolean;
  approve: () => void;
  cancel: () => void;
}) {
  const { t } = useLanguage();
  const price = getPermitPriceSummary(product, form);
  return (
    <section
      className="permit-vipps-payment"
      aria-labelledby="vipps-payment-title"
      aria-busy={isSubmitting}
    >
      <div className="permit-vipps-brand">{t("payment.vipps")}</div>
      <h3 id="vipps-payment-title" tabIndex={-1}>
        {t("payment.approveTitle")}
      </h3>
      <p className="permit-vipps-merchant">{product.seller.organization}</p>
      <strong className="permit-vipps-amount">{price.totalNok} kr</strong>
      <p>{t(product.title)}</p>
      <div className="permit-vipps-account">
        <Icon name="shield" size={24} />
        <span>
          <b>{form.fullName}</b>
          <span>{form.phone}</span>
        </span>
      </div>
      <p className="permit-vipps-caption">{t("payment.noCharge")}</p>
      <button className="primary" type="button" disabled={isSubmitting} onClick={approve}>
        {isSubmitting
          ? t("payment.processing")
          : t("payment.approveAmount", { amount: price.totalNok })}
      </button>
      <button className="secondary" type="button" disabled={isSubmitting} onClick={cancel}>
        {t("payment.cancel")}
      </button>
    </section>
  );
}
