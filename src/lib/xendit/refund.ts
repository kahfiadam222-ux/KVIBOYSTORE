import { xendit } from "./client";

export async function refundInvoice(params: {
  invoiceId: string;
  amount: number;
  currency: string;
}) {
  return xendit.Refund.createRefund({
    data: {
      invoiceId: params.invoiceId,
      amount: params.amount,
      currency: params.currency,
      reason: "REQUESTED_BY_CUSTOMER",
    },
  });
}
