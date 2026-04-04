import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { Reorder } from "framer-motion";
import "./AdminPanel.css";

const CATEGORIES = ["fullstack", "frontend", "backend", "ml", "other"];

const EMPTY_FORM = {
  title: "",
  shortDescription: "",
  description: "",
  techStack: [],
  imageUrls: [],
  placeholderColor: "#1e293b",
  demoLink: null,
  repoLink: null,
  featured: false,
  isConfidential: false,
  category: "other",
  year: new Date().getFullYear(),
};

export function AdminPanel() {
  const { logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [techSuggestions, setTechSuggestions] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("projects"); // "projects" or "profile"

  // Profile state
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState(null);

  // ----- Image upload -----
  async function handleImageFile(file) {
    setUploading(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail ?? "Upload failed");
      }
      const { url } = await res.json();
      set("imageUrls", [...form.imageUrls, url]);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleProfileImageUpload(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setProfileForm(f => ({ ...f, image_url: url }));
    } catch (err) {
      alert("Profile image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleResumeUpload(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = localStorage.getItem("admin_token");
      // We use a fixed filename to keep the URL professional and consistent
      const res = await fetch("/api/upload-image?custom_path=Adam_Amzar_Resume.pdf", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setProfileForm(f => ({ ...f, resume_url: url }));
      alert("Resume uploaded successfully!");
    } catch (err) {
      alert("Resume upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/projects/all");
      setProjects(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadTechSuggestions() {
    try {
      const data = await api.get("/tech-tags");
      setTechSuggestions(data);
    } catch (e) {
      console.error("Failed to load tech tags", e);
    }
  }

  async function loadProfile() {
    try {
      const data = await fetch("/api/profile").then(res => res.json());
      setProfile(data);
      setProfileForm(data);
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }

  useEffect(() => {
    loadProjects();
    loadTechSuggestions();
    loadProfile();
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      await api.put("/profile", profileForm);
      setProfile(profileForm);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setProfileSubmitting(false);
    }
  }

  // ----- Form helpers -----
  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(p) {
    setEditId(p.id);
    setForm({
      title: p.title,
      shortDescription: p.shortDescription,
      description: p.description,
      techStack: p.techStack,
      imageUrls: p.imageUrls || [],
      placeholderColor: p.placeholderColor,
      demoLink: p.demoLink,
      repoLink: p.repoLink,
      featured: p.featured,
      isConfidential: p.isConfidential,
      category: p.category,
      year: p.year,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, form);
      } else {
        await api.post("/projects", { ...form, isActive: 1 });
      }
      setShowForm(false);
      await loadProjects();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Soft-delete this project? It won't appear on the public portfolio.")) return;
    await api.delete(`/projects/${id}`);
    await loadProjects();
  }

  async function handleRestore(id) {
    await api.patch(`/projects/${id}/restore`);
    await loadProjects();
  }

  async function handleReorder(newOrder) {
    // Optimistic update
    setProjects(newOrder);
    try {
      await api.post("/projects/reorder", newOrder.map(p => p.id));
    } catch (err) {
      console.error("Reorder failed", err);
      loadProjects(); // Rollback if failed
    }
  }

  // ----- Field helpers -----
  const set = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  function handleAddTag(tag) {
    const trimmed = tag.trim();
    if (trimmed && !form.techStack.includes(trimmed)) {
      set("techStack", [...form.techStack, trimmed]);
      setNewTag("");
      // Update local suggestions if it's new
      if (!techSuggestions.includes(trimmed)) {
        setTechSuggestions(prev => [...prev, trimmed].sort());
      }
    }
  }

  function handleRemoveTag(tag) {
    set("techStack", form.techStack.filter(t => t !== tag));
  }

  function handleRemoveImage(url) {
    set("imageUrls", form.imageUrls.filter(u => u !== url));
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <a href="/" className="admin-back">← Portfolio</a>
          <h1 className="admin-title">Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === "projects" ? "active" : ""}`} 
              onClick={() => setActiveTab("projects")}
            >
              Projects
            </button>
            <button 
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} 
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
          </div>
          {activeTab === "projects" && (
            <button className="btn-add" onClick={openAdd}>+ Add Project</button>
          )}
          <button className="btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Content */}
      <main className="admin-main">
        {loading && <p className="admin-status">Loading…</p>}
        {error && <p className="admin-error">{error}</p>}

        {!loading && !error && activeTab === "projects" && (
          <div className="project-table-wrap">
            <table className="project-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>No.</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Year</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <Reorder.Group axis="y" values={projects} onReorder={handleReorder} as="tbody">
                {projects.map((p, index) => (
                  <Reorder.Item
                    key={p.id}
                    value={p}
                    as="tr"
                    className={p.isActive === 0 ? "row-inactive drabbable-row" : "drabbable-row"}
                    whileDrag={{ 
                      scale: 1.01, 
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.4)" 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <td className="drag-handle-cell">
                      <span className="order-number">{index + 1}</span>
                      <span className="drag-icon">⋮⋮</span>
                    </td>
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
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === "profile" && profileForm && (
          <div className="profile-editor-wrap">
            <h2 className="section-title">Edit Portfolio Profile</h2>
            <form onSubmit={handleProfileSubmit} className="admin-form profile-form">
              <div className="form-grid-2">
                <div className="form-row">
                  <label>Name</label>
                  <input 
                    value={profileForm.name} 
                    onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  />
                </div>
                <div className="form-row">
                  <label>Eyebrow Text</label>
                  <input 
                    value={profileForm.eyebrow} 
                    onChange={e => setProfileForm({...profileForm, eyebrow: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Main Title</label>
                <input 
                  value={profileForm.title} 
                  onChange={e => setProfileForm({...profileForm, title: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <label>Subtitle / Bio</label>
                <textarea 
                  value={profileForm.subtitle} 
                  onChange={e => setProfileForm({...profileForm, subtitle: e.target.value})} 
                  rows={4}
                />
              </div>

              <div className="form-row">
                <label>Profile Image</label>
                <div className="image-management-area">
                  <div className="profile-tuning-layout">
                    {profileForm.image_url && (
                      <div className="tuning-preview-section">
                        <label className="sub-label">Live Preview</label>
                        <div className="tuning-preview-frame">
                          <img 
                            src={profileForm.image_url} 
                            alt="Profile Preview" 
                            style={{
                              objectPosition: `${profileForm.image_x ?? 50}% ${profileForm.image_y ?? 50}%`,
                              transform: `scale(${profileForm.image_zoom ?? 1})`
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="tuning-controls-section">
                      <div className="image-upload-area"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleProfileImageUpload(f); }}
                      >
                        <label className="image-drop-label" htmlFor="profile-img-input">
                          {uploading ? (
                            <span className="upload-spinner">⏳ Uploading…</span>
                          ) : (
                            <>
                              <span className="upload-icon">🖼️</span>
                              <span>{profileForm.image_url ? "Change image" : "Upload image"}</span>
                            </>
                          )}
                        </label>
                        <input
                          id="profile-img-input"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleProfileImageUpload(f);
                          }}
                        />
                      </div>

                      {profileForm.image_url && (
                        <div className="image-tuning-sliders">
                          <div className="slider-row">
                            <div className="slider-info">
                              <label>Zoom</label>
                              <span>{profileForm.image_zoom?.toFixed(1) || "1.0"}x</span>
                            </div>
                            <input 
                              type="range" min="1" max="3" step="0.1" 
                              value={profileForm.image_zoom || 1} 
                              onChange={e => setProfileForm({...profileForm, image_zoom: parseFloat(e.target.value)})}
                            />
                          </div>
                          
                          <div className="slider-row">
                            <div className="slider-info">
                              <label>Horizontal Position</label>
                              <span>{Math.round(profileForm.image_x) || "50"}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="100" step="1" 
                              value={profileForm.image_x || 50} 
                              onChange={e => setProfileForm({...profileForm, image_x: parseInt(e.target.value)})}
                            />
                          </div>

                          <div className="slider-row">
                            <div className="slider-info">
                              <label>Vertical Position</label>
                              <span>{Math.round(profileForm.image_y) || "50"}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="100" step="1" 
                              value={profileForm.image_y || 50} 
                              onChange={e => setProfileForm({...profileForm, image_y: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <label>Resume PDF</label>
                <div className="resume-upload-section">
                  <div className="image-upload-area"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleResumeUpload(f); }}
                  >
                    <label className="image-drop-label" htmlFor="resume-file-input">
                      {uploading ? (
                        <span className="upload-spinner">⏳ Uploading…</span>
                      ) : (
                        <>
                          <span className="upload-icon">📄</span>
                          <span>{profileForm.resume_url ? "Replace Resume PDF" : "Upload Resume PDF"}</span>
                        </>
                      )}
                    </label>
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleResumeUpload(f);
                      }}
                    />
                  </div>
                  {profileForm.resume_url && (
                    <div className="resume-status-bar">
                      <span className="status-tag">✓ Resume uploaded</span>
                      <a href="/api/resume" target="_blank" rel="noopener noreferrer" className="preview-link">View Current PDF</a>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="sub-section-title">Social Links</h3>
              <div className="form-grid-3">
                {["linkedin", "whatsapp", "gmail"].map(key => (
                  <div key={key} className="form-row social-mgr-row">
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)} {key === "gmail" ? "Email" : "URL"}</label>
                    <input 
                      value={profileForm.socials[key]?.url || ""} 
                      onChange={e => setProfileForm({
                        ...profileForm, 
                        socials: {
                          ...profileForm.socials, 
                          [key]: { ...profileForm.socials[key], url: e.target.value }
                        }
                      })} 
                      placeholder={key === "gmail" ? "example@gmail.com" : "https://..."}
                    />
                    <div className="toggle-container">
                      <span className="toggle-label">Status: </span>
                      <button 
                        type="button"
                        className={`toggle-text-btn ${profileForm.socials[key]?.enabled ? "enabled" : "disabled"}`}
                        onClick={() => setProfileForm({
                          ...profileForm,
                          socials: {
                            ...profileForm.socials,
                            [key]: { ...profileForm.socials[key], enabled: !profileForm.socials[key]?.enabled }
                          }
                        })}
                      >
                        {profileForm.socials[key]?.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={profileSubmitting || uploading}>
                  {profileSubmitting ? "Saving..." : uploading ? "Uploading..." : "Update Profile"}
                </button>
              </div>
            </form>
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
                <label>Tech Stack</label>
                <div className="tech-stack-manager">
                  <div className="tech-tags-list">
                    {form.techStack.map((tag) => (
                      <span key={tag} className="tech-tag">
                        {tag}
                        <button type="button" className="btn-remove-tag" onClick={() => handleRemoveTag(tag)}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="add-tag-row">
                    <input
                      list="tech-suggestions"
                      value={newTag}
                      placeholder="Add a technology (e.g. React)..."
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag(newTag);
                        }
                      }}
                    />
                    <datalist id="tech-suggestions">
                      {techSuggestions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                    <button type="button" className="btn-add-tag" onClick={() => handleAddTag(newTag)}>Add</button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label>Project Images *</label>
                <div className="image-management-area">
                  <div className="image-previews-grid">
                    {form.imageUrls.map((url) => (
                      <div key={url} className="image-preview-item">
                        <img src={url} alt="preview" className="image-preview" />
                        <button type="button" className="btn-remove-image" onClick={() => handleRemoveImage(url)}>✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="image-upload-area"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                  >
                    <label className="image-drop-label" htmlFor="img-file-input">
                      {uploading ? (
                        <span className="upload-spinner">⏳ Uploading…</span>
                      ) : (
                        <>
                          <span className="upload-icon">🖼️</span>
                          <span>{form.imageUrls.length > 0 ? "Add more images" : "Click to choose or drag & drop"}</span>
                          <span className="upload-hint">JPEG, PNG, WEBP, GIF · max 5 MB</span>
                        </>
                      )}
                    </label>
                    <input
                      id="img-file-input"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(f => handleImageFile(f));
                      }}
                    />
                  </div>
                </div>
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
                <button type="submit" className="btn-save" disabled={submitting || uploading}>
                  {submitting ? "Saving…" : uploading ? "Uploading image…" : editId ? "Save Changes" : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
