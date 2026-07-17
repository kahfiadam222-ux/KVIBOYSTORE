export type StatusTone = "neutral" | "warning" | "success" | "error";

// Buyer-facing copy — never surfaces internal enum names, per the checkout UX design
// (the escrow explanation is what actually earns trust during the post-payment wait).
// `tone` drives the badge color: warning = needs attention, success = resolved well,
// error = something went wrong, neutral = resolved but not a clean success.
export const orderStateLabels: Record<
  string,
  { label: string; description: string; tone: StatusTone }
> = {
  created: {
    label: "Menunggu pembayaran",
    description: "Selesaikan pembayaran untuk melanjutkan pesanan.",
    tone: "warning",
  },
  payment_held: {
    label: "Pembayaran diamankan",
    description:
      "Pembayaran Anda ditahan dengan aman dan akan diproses untuk pengiriman. Dana tidak dilepas ke penjual sampai Anda konfirmasi.",
    tone: "warning",
  },
  awaiting_delivery: {
    label: "Menunggu pengiriman",
    description: "Penjual sedang menyiapkan pesanan Anda.",
    tone: "warning",
  },
  delivered: {
    label: "Sudah dikirim",
    description: "Cek detail produk dan konfirmasi jika semuanya sesuai.",
    tone: "warning",
  },
  buyer_confirmed: {
    label: "Selesai",
    description: "Anda sudah mengonfirmasi pesanan ini.",
    tone: "success",
  },
  payout_released: {
    label: "Selesai",
    description: "Pembayaran sudah diteruskan ke penjual.",
    tone: "success",
  },
  completed: {
    label: "Selesai",
    description: "Pesanan ini sudah selesai.",
    tone: "success",
  },
  buyer_disputed: {
    label: "Dalam peninjauan",
    description: "Tim kami sedang meninjau laporan Anda untuk pesanan ini.",
    tone: "error",
  },
  delivery_timeout: {
    label: "Melewati batas waktu",
    description: "Pesanan belum dikirim tepat waktu, sedang ditinjau tim kami.",
    tone: "error",
  },
  auto_escalated: {
    label: "Dalam peninjauan",
    description: "Pesanan ini sedang ditinjau tim kami.",
    tone: "error",
  },
  under_review: {
    label: "Dalam peninjauan",
    description: "Tim kami sedang meninjau pesanan ini.",
    tone: "error",
  },
  refunded: {
    label: "Dana dikembalikan",
    description: "Pembayaran Anda sudah dikembalikan.",
    tone: "neutral",
  },
  cancelled: {
    label: "Dibatalkan",
    description: "Pesanan dibatalkan atau pembayaran kedaluwarsa. Stok dikembalikan.",
    tone: "neutral",
  },
};
