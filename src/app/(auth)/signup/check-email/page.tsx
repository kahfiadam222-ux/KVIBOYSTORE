import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Cek email Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Kami sudah mengirim link konfirmasi ke email Anda. Klik link
            tersebut untuk mengaktifkan akun.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
