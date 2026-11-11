import { resendCheckoutCode } from "./checkout_service.ts";

const input = {
  orderId: process.env.ORDER_ID ?? "order-demo-42",
  customerPhone: process.env.CUSTOMER_PHONE ?? "+15550001111",
  verificationCodeId: process.env.VERIFICATION_CODE_ID ?? "verification-demo-42",
  receiptEmail: process.env.RECEIPT_EMAIL ?? "creator@example.com",
};

console.log(await resendCheckoutCode(input));
