import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md bg-card border p-8 rounded-2xl shadow-sm">
        <h1 className="mb-4 text-6xl font-extrabold text-primary">404</h1>
        <p className="mb-6 text-xl font-semibold text-foreground">Página não encontrada</p>
        <p className="mb-8 text-muted-foreground">O endereço que você tentou acessar não existe ou foi movido para outro local.</p>
        <a href="/" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium transition-colors hover:bg-primary/90">
          Voltar para o Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
