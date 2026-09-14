import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="font-semibold text-foreground">AgendaPro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#recursos" className="hover:text-foreground">
              Recursos
            </a>
            <a href="#planos" className="hover:text-foreground">
              Planos
            </a>
            <a href="#faq" className="hover:text-foreground">
              Dúvidas
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-foreground hover:text-brand">
              Entrar
            </Link>
            <Link
              href="/registrar"
              className="inline-flex items-center h-9 px-4 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-sm text-muted flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} AgendaPro. Todos os direitos reservados.</p>
          <p>Sua agenda organizada. Seus clientes lembrados. Seu negócio crescendo.</p>
        </div>
      </footer>
    </div>
  );
}
