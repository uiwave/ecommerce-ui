import type { Metadata } from "next";

import { AdminView } from "@/features/admin/components/AdminView";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Panel de administración",
};

export default function AdminPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <AdminView />
      </div>
    </RequireAuth>
  );
}
