import type { CatchImageRepository } from "@/data/contracts/catch-image-repository";
import { operationSucceeded } from "@/domain/shared/operation-result";

export function createMemoryCatchImageRepository(): CatchImageRepository {
  const images = new Map<string, string>();
  return {
    get: async (id) => operationSucceeded(images.get(id) ?? null),
    save: async (id, imageData) => {
      images.set(id, imageData);
      return operationSucceeded(undefined);
    },
    remove: async (id) => {
      images.delete(id);
      return operationSucceeded(undefined);
    },
  };
}
