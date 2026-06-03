import type { ReactElement } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { ReconcileDocsApp } from "@/components/reconcile-docs";
import { MainLayout } from "@/components/layouts/MainLayout";
import { getAccessToken } from "@/functions/authSession";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) {
      void router.replace("/login");
    }
  }, [router]);

  return <ReconcileDocsApp />;
}

HomePage.layout = (page: ReactElement) => <MainLayout>{page}</MainLayout>;