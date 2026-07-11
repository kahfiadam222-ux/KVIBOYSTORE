// Buyer-facing copy — never surfaces internal enum names, per the checkout UX design
// (the escrow explanation is what actually earns trust during the post-payment wait).
export const orderStateLabels: Record<string, { label: string; description: string }> = {
  created: {
    label: "Menunggu pembayaran",
    description: "Selesaikan pembayaran untuk melanjutkan pesanan.",
  },
  payment_held: {
    label: "Pembayaran diamankan",
    description:
      "Pembayaran Anda ditahan dengan aman dan akan diproses untuk pengiriman. Dana tidak dilepas ke penjual sampai Anda konfirmasi.",
  },
  awaiting_delivery: {
    label: "Menunggu pengiriman",
    description: "Penjual sedang menyiapkan pesanan Anda.",
  },
  delivered: {
    label: "Sudah dikirim",
    description: "Cek detail produk dan konfirmasi jika semuanya sesuai.",
  },
  buyer_confirmed: {
    label: "Selesai",
    description: "Anda sudah mengonfirmasi pesanan ini.",
  },
  payout_released: {
    label: "Selesai",
    description: "Pembayaran sudah diteruskan ke penjual.",
  },
  completed: {
    label: "Selesai",
    description: "Pesanan ini sudah selesai.",
  },
  buyer_disputed: {
    label: "Dalam peninjauan",
    description: "Tim kami sedang meninjau laporan Anda untuk pesanan ini.",
  },
  delivery_timeout: {
    label: "Melewati batas waktu",
    description: "Pesanan belum dikirim tepat waktu, sedang ditinjau tim kami.",
  },
  auto_escalated: {
    label: "Dalam peninjauan",
    description: "Pesanan ini sedang ditinjau tim kami.",
  },
  under_review: {
    label: "Dalam peninjauan",
    description: "Tim kami sedang meninjau pesanan ini.",
  },
  refunded: {
    label: "Dana dikembalikan",
    description: "Pembayaran Anda sudah dikembalikan.",
  },
};
