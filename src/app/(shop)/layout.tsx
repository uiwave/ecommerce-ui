import { Navbar } from "@/components/layout/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <p className="mx-auto w-full max-w-6xl px-4 text-center text-xs text-muted-foreground">
          © Uiwave Commerce · Interfaz conectada a{" "}
          <code className="font-mono">ecommerce-api</code>
        </p>
      </footer>
    </div>
  );
}
