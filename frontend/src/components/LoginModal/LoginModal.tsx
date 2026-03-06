import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../utils/api";
import "./LoginModal.css";

interface Props {
  onClose: () => void;
}

export function LoginModal({ onClose }: Props) {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await loginApi(password);
      login(token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-icon">🔐</div>
        <h2 className="modal-title">Admin Login</h2>
        <p className="modal-subtitle">Enter your admin password to access the control panel.</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="password"
            className="modal-input"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
