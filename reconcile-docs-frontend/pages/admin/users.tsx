import type { ReactElement } from "react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layouts/MainLayout";
import { reconcileDocsApi } from "@/functions/api/reconcileDocsApi";
import { useAuthSession } from "@/functions/useAuthSession";

export default function AdminUsersPage() {
  const router = useRouter();
  const { session } = useAuthSession();
  const isAdmin = session?.role === "Admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session === null) {
      return;
    }

    if (session.role !== "Admin") {
      void router.replace("/");
    }
  }, [router, session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await reconcileDocsApi.createUser({ username, password, role });
    setLoading(false);

    if (result.error || !result.data) {
      setMessage(result.problem?.title ?? result.error?.message ?? "Unable to create user.");
      return;
    }

    setUsername("");
    setPassword("");
    setRole("User");
    setMessage(`Created ${result.data.username} (${result.data.role}).`);
  }

  if (!session) {
    return <div className="py-10 text-slate-500">Checking session...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardBody className="space-y-3">
            <CardTitle className="text-2xl">Access denied</CardTitle>
            <p className="text-sm text-slate-600">Only admins can access this page.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardBody className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-700/70">Admin</p>
            <CardTitle className="text-3xl text-slate-900">Create user</CardTitle>
          </div>

          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="new-username">Username</label>
              <Input
                id="new-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="new user name"
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="new-password">Password</label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="minimum 8 characters"
                className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:ring-cyan-200"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="new-role">Role</label>
              <select
                id="new-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {message && <p className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</p>}
            <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
              <Button disabled={loading} type="submit">
                {loading ? "Creating..." : "Create user"}
              </Button>
              <Button className="bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => router.push("/")} type="button">
                Back to dashboard
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

AdminUsersPage.layout = (page: ReactElement) => <MainLayout>{page}</MainLayout>;