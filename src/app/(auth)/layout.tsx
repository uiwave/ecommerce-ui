import { Brand } from "@/components/layout/Brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-muted/30">
      <header className="flex justify-center px-4 py-6">
        <Brand />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">
        {children}
      </main>
      <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
        Uiwave Commerce · Interfaz conectada a{" "}
        <code className="font-mono">ecommerce-api</code>
      </footer>
    </div>
  );
}
