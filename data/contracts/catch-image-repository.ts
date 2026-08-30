import type { OperationResult } from "@/domain/shared/operation-result";

export interface CatchImageRepository {
  get(id: string): Promise<OperationResult<string | null>>;
  save(id: string, imageData: string): Promise<OperationResult<void>>;
  remove(id: string): Promise<OperationResult<void>>;
}
