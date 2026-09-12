import { useLanguage } from "@/components/localization/language-provider";

export function FormError({ id, message }: { id?: string; message?: string }) {
  const { t } = useLanguage();
  if (!message) return null;

  return (
    <p className="field-error" id={id} role="alert">
      {t(message)}
    </p>
  );
}
