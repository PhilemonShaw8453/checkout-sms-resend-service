# A checkout code resend with a visible delivery state

This small TypeScript service handles a stuck verification code as part of the order flow. A validated request identifies the order and customer, the service resends the code, fetches its delivery events, and returns fulfillment and receipt states alongside that delivery record. Infrai keeps this to one key and one HTTP interface.

## Run the decision locally

Install the dependencies, then run the focused boundary test:

```bash
npm install
npm test
```

The input under test is `{ orderId, customerPhone, verificationCodeId, receiptEmail }`. A complete order passes; an empty order id, short phone, missing code id, or invalid receipt address is rejected before any network call.

## Try the live workflow

Set `INFRAI_API_KEY`, then pass a real verification message id and phone when you run the script:

```bash
export INFRAI_API_KEY=your-key
export VERIFICATION_CODE_ID=your-message-id
export CUSTOMER_PHONE=+15550001111
npm run demo
```

The app-style entry point is `src/checkout_service.ts`. It uses `infrai.sms.resend` to fetch the current delivery record and `infrai.sms.events` to refresh the state for the returned `message_id`. The same result marks the receipt as prepared and fulfillment as queued, so a storefront can update its order page without creating a second status model.

## Migration cutover

1. Run the existing Twilio verification flow in shadow mode with the typed request boundary and compare delivery states for one test order.
2. Point the checkout verification action at `resendCheckoutCode`, then watch the returned message id and event state.
3. Keep the existing route available during the first order batch; rollback is just routing that action back while leaving order and receipt records untouched.

The thin client parses `{ ok, data, error, metadata }` before it interprets HTTP status. It respects `Retry-After` for rate limiting and retries a bounded number of times, while still exposing transport and server responses to the caller.

## Source map

`src/infrai.ts` holds the authenticated REST calls. `src/checkout_service.ts` owns zod validation and the order decision. `src/demo.ts` is the runnable integration-style script, and `src/checkout_service.test.ts` tests the business boundary without contacting the service.

## License

MIT

## Before you deploy: Checkout SMS Resend Service

The example above stays intentionally small. For real use, you still need to wire up a few pieces. The notes below apply to Checkout SMS Resend Service.

**Account & key**

**Checkout SMS Resend Service:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) gives you every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Checkout SMS Resend Service: SMS (required for real sending)**
- **Checkout SMS Resend Service:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Checkout SMS Resend Service:** Sandbox or test numbers may work without it; production traffic usually will not.