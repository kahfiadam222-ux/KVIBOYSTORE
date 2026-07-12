import { Navbar } from "@/components/nav/Navbar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
