import type { PermitPurchase } from "../../domain/fishing-permits/permit-purchase.ts";
import type { OperationResult } from "../../domain/shared/operation-result.ts";
export interface PermitPurchaseRepository {
  list(): OperationResult<PermitPurchase[]>;
  save(purchase: PermitPurchase): OperationResult<void>;
  clear(): OperationResult<void>;
}
