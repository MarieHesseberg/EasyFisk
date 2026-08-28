import { FormError } from "@/components/ui/form-error";
import { Icon } from "@/components/ui/icon";

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
  return (
    <>
      <label className={className}>
        <Icon name="fish" />
        <span>
          <b>{imageName || "Legg til bilde"}</b>
          <small>{description}</small>
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
      </label>
      <FormError message={error} />
    </>
  );
}
