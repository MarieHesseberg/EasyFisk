export type FeedbackMessage = {
  id: string;
  reference: string;
  category: string;
  description: string;
  createdAt: number;
  status: "simulated-received";
  position?: [number, number];
  image?: Blob;
  imageName?: string;
};

export function isFeedbackMessage(value: unknown): value is FeedbackMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as FeedbackMessage;
  return (
    typeof m.id === "string" &&
    !!m.id &&
    typeof m.reference === "string" &&
    typeof m.category === "string" &&
    !!m.category &&
    typeof m.description === "string" &&
    m.description.trim().length >= 10 &&
    m.description.length <= 1000 &&
    Number.isFinite(m.createdAt) &&
    m.status === "simulated-received" &&
    (m.position === undefined ||
      (Array.isArray(m.position) &&
        m.position.length === 2 &&
        m.position.every(Number.isFinite) &&
        Math.abs(m.position[0]) <= 90 &&
        Math.abs(m.position[1]) <= 180)) &&
    (m.image === undefined ||
      (m.image instanceof Blob &&
        m.image.size > 0 &&
        m.image.size <= 5 * 1024 * 1024 &&
        ["image/png", "image/jpeg"].includes(m.image.type))) &&
    (m.imageName === undefined || typeof m.imageName === "string")
  );
}
