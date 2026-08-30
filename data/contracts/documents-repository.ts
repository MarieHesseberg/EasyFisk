import type { FishingDocument } from "@/domain/documents/fishing-document";
import type { OperationResult } from "@/domain/shared/operation-result";

export interface DocumentsRepository {
  list(): Promise<OperationResult<FishingDocument[]>>;
  save(document: FishingDocument): Promise<OperationResult<void>>;
  remove(id: string): Promise<OperationResult<void>>;
}
