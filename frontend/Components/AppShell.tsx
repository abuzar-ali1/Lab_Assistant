import AppHeader from "@/Components/AppHeader";
import ProtectedRoute from "@/Components/ProtectedRoute";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <AppHeader />
        <main className="pt-[72px]">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
