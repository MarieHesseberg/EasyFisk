import type { OperationResult } from "../shared/operation-result.ts";
import { operationFailed, operationSucceeded } from "../shared/operation-result.ts";

export const maximumImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png"]);

export function validateImage(file: Pick<File, "size" | "type">): OperationResult<void> {
  if (!allowedImageTypes.has(file.type)) return operationFailed("Bildet må være JPG eller PNG.");
  if (file.size > maximumImageBytes)
    return operationFailed("Bildet kan ikke være større enn 5 MB.");
  return operationSucceeded(undefined);
}
