import { FormError } from "@/components/ui/form-error";
import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";

export function ImageUploadField({
  className,
  description,
  error,
  imageName,
  selectImage,
}: {
  className: string;
  description: string;
  error?: string;
  imageName: string;
  selectImage: (file?: File) => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      <label className={className}>
        <Icon name="fish" />
        <span>
          <b>{imageName || t("copy.legg.til.bilde.ace7cf0")}</b>
          <small>{description}</small>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
      </label>
      <FormError message={error ? t(error) : undefined} />
    </>
  );
}
