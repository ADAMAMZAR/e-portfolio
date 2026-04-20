import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Portfolio } from "./pages/Portfolio";
import { AdminPanel } from "./pages/AdminPanel";
import { CommandBar } from "./components/CommandBar/CommandBar";
import { NavBar } from "./components/NavBar/NavBar";
function Router() {
  const { isAdmin, login } = useAuth();
  const [, setRerender] = useState(0); // Trigger re-render on manual navigation
  const path = window.location.pathname;

  useEffect(() => {
    /** @param {KeyboardEvent} e */
    const handleKeyDown = (e) => {
      // Shortcut: Alt + Shift + L (Admin Bypass)
      if (e.altKey && e.shiftKey && (e.key === "L" || e.key === "l")) {
        e.preventDefault();
        
        // Directly open the admin (bypass security first)
        login("bypass_token");
        window.history.pushState({}, "", "/admin");
        setRerender(Date.now()); // Using Date.now() to avoid weird linting args errors
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [login]);

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
      <NavBar />
      <CommandBar />
      <Router />
    </AuthProvider>
  );
}
