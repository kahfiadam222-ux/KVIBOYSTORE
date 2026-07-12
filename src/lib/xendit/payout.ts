import { xendit } from "./client";

export async function payoutToSeller(params: {
  orderId: string;
  amount: number;
  currency: string;
  channelCode: string;
  accountNumber: string;
  accountHolderName: string;
}) {
  return xendit.Payout.createPayout({
    idempotencyKey: params.orderId,
    data: {
      referenceId: params.orderId,
      channelCode: params.channelCode,
      channelProperties: {
        accountNumber: params.accountNumber,
        accountHolderName: params.accountHolderName,
      },
      amount: params.amount,
      currency: params.currency,
      description: `KVIBOYSTORE payout for order ${params.orderId}`,
    },
  });
}
