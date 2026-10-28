import type { Metadata } from "next";

import { AccountView } from "@/features/account/components/AccountView";
import { RequireAuth } from "@/features/auth/RequireAuth";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default function AccountPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <AccountView />
      </div>
    </RequireAuth>
  );
}
