import assert from "node:assert/strict";
import { checkoutRequest } from "./checkout_service.ts";

const parsed = checkoutRequest.safeParse({ orderId: "order-7", customerPhone: "+15551234567", verificationCodeId: "msg-7", receiptEmail: "buyer@example.com" });
assert.equal(parsed.success, true);
assert.equal(checkoutRequest.safeParse({ orderId: "", customerPhone: "bad", verificationCodeId: "", receiptEmail: "bad" }).success, false);
console.log("checkout request boundary: valid orders pass, incomplete orders stop before delivery");
