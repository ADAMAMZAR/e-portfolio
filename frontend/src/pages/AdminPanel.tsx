import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { type Project } from "../types/project";
import "./AdminPanel.css";

const CATEGORIES = ["fullstack", "frontend", "backend", "ml", "other"] as const;

type ProjectForm = Omit<Project, "id" | "isActive">;
const EMPTY_FORM: ProjectForm = {
  title: "",
  shortDescription: "",
  description: "",
  techStack: [],
  imageUrl: "",
  placeholderColor: "#1e293b",
  demoLink: null,
  repoLink: null,
  featured: false,
  isConfidential: false,
  category: "other",
  year: new Date().getFullYear(),
  order: 0,
};

export function AdminPanel() {
  const { logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Project[]>("/projects/all");
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  // ----- Form helpers -----
  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditId(p.id);
    setForm({
      title: p.title,
      shortDescription: p.shortDescription,
      description: p.description,
      techStack: p.techStack,
      imageUrl: p.imageUrl,
      placeholderColor: p.placeholderColor,
      demoLink: p.demoLink,
      repoLink: p.repoLink,
      featured: p.featured,
      isConfidential: p.isConfidential,
      category: p.category,
      year: p.year,
      order: p.order,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editId) {
        await api.put<Project>(`/projects/${editId}`, form);
      } else {
        await api.post<Project>("/projects", { ...form, isActive: 1 });
      }
      setShowForm(false);
      await loadProjects();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Soft-delete this project? It won't appear on the public portfolio.")) return;
    await api.delete<Project>(`/projects/${id}`);
    await loadProjects();
  }

  async function handleRestore(id: string) {
    await api.patch<Project>(`/projects/${id}/restore`);
    await loadProjects();
  }

  // ----- Field helpers -----
  const set = (field: keyof ProjectForm, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="/" className="admin-back">← Portfolio</a>
          <h1 className="admin-title">Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <button className="btn-add" onClick={openAdd}>+ Add Project</button>
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Content */}
      <main className="admin-main">
        {loading && <p className="admin-status">Loading projects…</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && (
          <div className="project-table-wrap">
            <table className="project-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className={p.isActive === 0 ? "row-inactive" : ""}>
                    <td>
                      <span className="proj-title">{p.title}</span>
                      <span className="proj-desc">{p.shortDescription}</span>
                    </td>
                    <td><span className={`badge badge-${p.category}`}>{p.category}</span></td>
                    <td>{p.year}</td>
                    <td>{p.featured ? "⭐" : "—"}</td>
                    <td>
                      <span className={`status-pill ${p.isActive === 1 ? "status-active" : "status-inactive"}`}>
                        {p.isActive === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                      {p.isActive === 1 ? (
                        <button className="btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                      ) : (
                        <button className="btn-restore" onClick={() => handleRestore(p.id)}>Restore</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Project Form Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowForm(false)}>✕</button>
            <h2 className="form-modal-title">{editId ? "Edit Project" : "Add Project"}</h2>

            <form onSubmit={handleFormSubmit} className="project-form">
              <div className="form-row">
                <label>Title *</label>
                <input required value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={60} />
              </div>
              <div className="form-row">
                <label>Short Description *</label>
                <input required value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} maxLength={140} />
              </div>
              <div className="form-row">
                <label>Full Description *</label>
                <textarea required value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} />
              </div>
              <div className="form-row">
                <label>Tech Stack (comma-separated)</label>
                <input
                  value={form.techStack.join(", ")}
                  onChange={(e) => set("techStack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
              </div>
              <div className="form-row">
                <label>Image URL *</label>
                <input required value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
              </div>
              <div className="form-grid-2">
                <div className="form-row">
                  <label>Placeholder Color</label>
                  <div className="color-row">
                    <input type="color" value={form.placeholderColor} onChange={(e) => set("placeholderColor", e.target.value)} />
                    <input value={form.placeholderColor} onChange={(e) => set("placeholderColor", e.target.value)} maxLength={7} />
                  </div>
                </div>
                <div className="form-row">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-grid-2">
                <div className="form-row">
                  <label>Year</label>
                  <input type="number" value={form.year} min={2000} max={2100} onChange={(e) => set("year", +e.target.value)} />
                </div>
                <div className="form-row">
                  <label>Order</label>
                  <input type="number" value={form.order} min={0} onChange={(e) => set("order", +e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <label>Demo Link</label>
                <input value={form.demoLink ?? ""} onChange={(e) => set("demoLink", e.target.value || null)} placeholder="https://…" />
              </div>
              <div className="form-row">
                <label>Repo Link</label>
                <input value={form.repoLink ?? ""} onChange={(e) => set("repoLink", e.target.value || null)} placeholder="https://github.com/…" />
              </div>
              <div className="form-checkboxes">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
                  Featured
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isConfidential} onChange={(e) => set("isConfidential", e.target.checked)} />
                  Confidential
                </label>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={submitting}>
                  {submitting ? "Saving…" : editId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
