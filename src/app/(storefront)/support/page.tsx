import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, MessageCircle, Mail, Phone, Clock, Send } from "lucide-react";

export default async function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <HelpCircle className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Pusat Bantuan</h1>
        <p className="text-sm text-muted-foreground">
          Butuh bantuan? Tim kami siap membantu Anda 24/7
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-4">
          <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Hubungi Kami</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href="#"
                className="flex items-center gap-3 rounded-xl bg-green-500/10 p-3 transition-all hover:bg-green-500/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Respon cepat dalam 5 menit</p>
                </div>
              </a>

              <a
                href="mailto:support@kviboystore.com"
                className="flex items-center gap-3 rounded-xl bg-primary/10 p-3 transition-all hover:bg-primary/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-xs text-muted-foreground">support@kviboystore.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Jam Operasional</p>
                  <p className="text-xs text-muted-foreground">24 Jam (Senin - Minggu)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg">Pertanyaan Umum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-semibold text-sm">Bagaimana cara membayar?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pembayaran melalui Xendit dengan berbagai metode: QRIS, transfer bank, e-wallet.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-semibold text-sm">Berapa lama pengiriman?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Produk instant delivery akan dikirim otomatis dalam 1 menit setelah pembayaran.
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="font-semibold text-sm">Bagaimana jika kode tidak berfungsi?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hubungi support kami untuk penggantian atau refund sesuai kebijakan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="border-border bg-card/40 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Kirim Pesan</CardTitle>
            <CardDescription>
              Isi form di bawah dan tim kami akan menghubungi Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" placeholder="Nama Anda" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@contoh.com" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input id="subject" placeholder="Masalah pembayaran" className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Pesan</Label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Jelaskan masalah Anda..."
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                <Send className="mr-2 h-4 w-4" />
                Kirim Pesan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
