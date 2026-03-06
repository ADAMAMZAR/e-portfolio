import { AuthProvider, useAuth } from "./context/AuthContext";
import { Portfolio } from "./pages/Portfolio";
import { AdminPanel } from "./pages/AdminPanel";

function Router() {
  const { isAdmin } = useAuth();
  const path = window.location.pathname;

  if (path === "/admin") {
    if (!isAdmin) {
      // Redirect to home if not logged in
      window.location.replace("/");
      return null;
    }
    return <AdminPanel />;
  }

  return <Portfolio />;
}

export function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
