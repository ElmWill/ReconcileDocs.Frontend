import type { ReactElement } from "react";
import { ReconcileDocsApp } from "@/components/reconcile-docs";
import { MainLayout } from "@/components/layouts/MainLayout";

export default function HomePage() {
  return <ReconcileDocsApp />;
}

HomePage.layout = (page: ReactElement) => <MainLayout>{page}</MainLayout>;