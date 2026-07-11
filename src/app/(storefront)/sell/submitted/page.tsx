import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellSubmittedPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Pendaftaran terkirim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tim kami akan meninjau pendaftaran Anda dalam 1–2 hari kerja. Kami
            akan menghubungi Anda lewat email begitu ada keputusan.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
