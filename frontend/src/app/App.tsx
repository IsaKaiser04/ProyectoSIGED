import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { navigationItems } from "../config/navigation";
import { EvaluacionCategoriaPage } from "../features/calificaciones";

export function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const selectedModule = useMemo(() => {
    return (
      navigationItems.find((item) => item.href === currentHash) ??
      navigationItems[0]
    );
  }, [currentHash]);

  return (
    <DashboardLayout>
      <EvaluacionCategoriaPage />
    </DashboardLayout>
  );
}
