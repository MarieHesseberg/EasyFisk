import type { AppContentRepository } from "../contracts/app-content-repository.ts";
import { mockAppContent } from "./mock-app-content.ts";

export const mockAppContentRepository: AppContentRepository = {
  getContent: () => structuredClone(mockAppContent),
};
