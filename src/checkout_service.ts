import { z } from "zod";
import { infrai, type ApiData } from "./infrai.ts";

export const checkoutRequest = z.object({
  orderId: z.string().min(1),
  customerPhone: z.string().min(7),
  verificationCodeId: z.string().min(1),
  receiptEmail: z.string().email(),
});
export type CheckoutRequest = z.infer<typeof checkoutRequest>;

export type CheckoutResult = {
  orderId: string;
  fulfillment: "queued";
  receipt: "prepared";
  delivery: ApiData;
};

export async function resendCheckoutCode(input: unknown): Promise<CheckoutResult> {
  const order = checkoutRequest.parse(input);
  const delivery = await infrai.sms.resend(order.verificationCodeId);
  const messageId = String(delivery.message_id ?? order.verificationCodeId);
  const state = await infrai.sms.events(messageId);
  return { orderId: order.orderId, fulfillment: "queued", receipt: "prepared", delivery: { ...state, message_id: messageId } };
}
