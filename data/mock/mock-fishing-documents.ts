import type { DocumentKind, FishingDocument } from "@/domain/documents/fishing-document";

export const mockFishingDocuments: Record<DocumentKind, FishingDocument> = {
  permit: {
    id: "test-permit",
    kind: "permit",
    updatedAt: Date.parse("2026-08-30T12:00:00+02:00"),
    values: {
      holder: "Testfisker",
      reference: "TEST-ME-10482",
      issuer: "Mandalselva Elveeigarlag",
      category: "Døgnkort",
      area: "Sone 3 · Øyslebø–Laudal",
      startsAt: "2026-08-30T00:00",
      endsAt: "2026-08-30T23:59",
    },
  },
  disinfection: {
    id: "test-disinfection",
    kind: "disinfection",
    updatedAt: Date.parse("2026-08-30T12:00:00+02:00"),
    values: {
      holder: "Testfisker",
      reportNumber: "TEST-DES-260830",
      performedAt: "2026-08-30T10:00",
      equipment: "Stang, snelle, håv og vadere",
    },
  },
  fee: {
    id: "test-fee",
    kind: "fee",
    updatedAt: Date.parse("2026-08-30T12:00:00+02:00"),
    values: {
      holder: "Testfisker",
      reference: "TEST-AVGIFT-2026",
      year: "2026",
      paidAt: "2026-05-20",
    },
  },
};
