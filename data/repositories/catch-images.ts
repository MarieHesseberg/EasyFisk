import { createBrowserCatchImageRepository } from "@/data/indexed-db/create-browser-catch-image-repository";
import { createMemoryCatchImageRepository } from "@/data/memory/create-memory-catch-image-repository";

export const catchImageRepository =
  typeof window === "undefined"
    ? createMemoryCatchImageRepository()
    : createBrowserCatchImageRepository();
