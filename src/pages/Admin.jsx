import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/Reveal.jsx";
import AdminAdsManager from "../components/AdminAdsManager.jsx";
import {
  clearSession,
  deleteTourEnquiry,
  getApplications,
  getAuthLog,
  getHealth,
  getInternships,
  getLeads,
  getSavedUser,
  getSessions,
  getTourEnquiries,
  postLogout,
  postRevokeSession,
  getGallery,
  postGalleryPhoto,
  deleteGalleryPhoto,
  getOffers,
  postSendOffer,
  deleteOffer,
  getAdminAds,
  postAdminAd,
  putAdminAd,
  toggleAdminAd,
  deleteAdminAd,
} from "../api.js";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ApplicationsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>Position</th>
            <th>Experience</th>
            <th>GitHub</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                {a.coverLetter && (
                  <p className="admin-note" title={a.coverLetter}>
                    “{a.coverLetter.slice(0, 80)}
                    {a.coverLetter.length > 80 ? "…" : ""}”
                  </p>
                )}
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone || "—"}</a>
              </td>
              <td>{a.position}</td>
              <td>{a.experience}</td>
              <td>
                {a.github ? (
                  <a href={a.github} target="_blank" rel="noopener noreferrer">
                    profile
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InternshipsTable({ rows, onPrepareOffer }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No internship applications yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Applied</th>
            <th>Candidate</th>
            <th>Contact</th>
            <th>College</th>
            <th>Domain</th>
            <th>Duration</th>
            <th>Resume</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td className="admin-date">{fmtDate(a.createdAt)}</td>
              <td>
                <strong>{a.name}</strong>
                <p className="admin-note">
                  {a.degree || "—"} · {a.year || "—"}
                  {a.message ? ` · “${a.message.slice(0, 60)}${a.message.length > 60 ? "…" : ""}”` : ""}
                </p>
              </td>
              <td>
                <a href={`mailto:${a.email}`}>{a.email}</a>
                <br />
                <a href={`tel:${a.phone}`}>{a.phone}</a>
              </td>
              <td>{a.college}</td>
              <td>{a.domain}</td>
              <td>{a.duration || "—"}</td>
              <td>
                {a.resumeUrl ? (
                  <a className="btn btn-outline btn-sm" href={a.resumeUrl} download>
                    <i className="bi bi-download"></i> Resume
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: "nowrap", padding: "5px 10px", fontSize: "12px" }}
                  onClick={() => onPrepareOffer && onPrepareOffer(a)}
                  title="Prepare & Send Official Offer Letter"
                >
                  <i className="bi bi-send-check me-1"></i> Send Offer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EVENT_META = {
  login: { icon: "bi-box-arrow-in-right", label: "Login", cls: "ok" },
  logout: { icon: "bi-box-arrow-left", label: "Logout", cls: "muted" },
  "force-logout": { icon: "bi-shield-x", label: "Force logout", cls: "warn" },
  failed: { icon: "bi-shield-exclamation", label: "Failed attempt", cls: "err" },
};

function AuthLogTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-clock-history"></i> No login activity recorded yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Email used</th>
            <th>Device</th>
            <th>IP address</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => {
            const meta = EVENT_META[e.type] || EVENT_META.failed;
            return (
              <tr key={e.id}>
                <td className="admin-date">{fmtDate(e.createdAt)}</td>
                <td>
                  <span className={`authpill ${meta.cls}`}>
                    <i className={`bi ${meta.icon}`}></i> {meta.label}
                  </span>
                </td>
                <td>{e.email || "—"}</td>
                <td>{e.device || e.deviceSummary || "—"}</td>
                <td className="admin-date">{e.ip || "—"}</td>
                <td className="admin-date">{e.location || "Resolving…"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SessionsPanel({ sessions, currentTokenPreview, onRevoke, busyPreview }) {
  if (!sessions.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-hdd-network"></i> No active sessions.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>IP address</th>
            <th>Location</th>
            <th>Signed in</th>
            <th>Last active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.tokenPreview}>
              <td>
                <strong>{s.device}</strong>
                {s.current && <span className="authpill ok" style={{ marginLeft: 8 }}><i className="bi bi-person-check"></i> This device</span>}
              </td>
              <td className="admin-date">{s.ip}</td>
              <td className="admin-date">{s.location || "Resolving…"}</td>
              <td className="admin-date">{fmtDate(s.createdAt)}</td>
              <td className="admin-date">{fmtDate(s.lastSeenAt)}</td>
              <td>
                {s.current ? (
                  <span className="admin-date">—</span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busyPreview === s.tokenPreview}
                    onClick={() => onRevoke(s.tokenPreview)}
                  >
                    <i className="bi bi-box-arrow-right"></i>{" "}
                    {busyPreview === s.tokenPreview ? "Logging out…" : "Force logout"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TourEnquiriesTable({ rows, onDelete, busyId }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No tour enquiries yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Destination</th>
            <th>Trip details</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="admin-date">{fmtDate(t.createdAt)}</td>
              <td>
                <strong>{t.name}</strong>
              </td>
              <td>
                <a href={`tel:${t.phone}`}>{t.phone}</a>
                <br />
                {t.email ? <a href={`mailto:${t.email}`}>{t.email}</a> : "—"}
              </td>
              <td>
                <strong>{t.destination}</strong>
                {t.scope && <div className="admin-note">{t.scope}</div>}
              </td>
              <td>
                <span className="admin-note">
                  {t.travelDate ? `📅 ${t.travelDate}` : "📅 —"}
                  <br />
                  👥 {t.travelers || "—"} travellers
                  {t.budget ? <><br />💰 {t.budget}</> : null}
                  {t.flightNeeded ? <><br />✈️ {t.flightNeeded}</> : null}
                  {t.passportAvailable ? <><br />🛂 {t.passportAvailable}</> : null}
                </span>
              </td>
              <td className="admin-msg">
                {t.message || "—"}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busyId === t.id}
                  onClick={() => onDelete(t.id)}
                >
                  <i className="bi bi-trash3"></i>{" "}
                  {busyId === t.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadsTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="admin-empty">
        <i className="bi bi-inbox"></i> No enquiries yet.
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Received</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Service</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id}>
              <td className="admin-date">{fmtDate(l.createdAt)}</td>
              <td>
                <strong>{l.name}</strong>
              </td>
              <td>
                <a href={`mailto:${l.email}`}>{l.email}</a>
                <br />
                <a href={`tel:${l.phone}`}>{l.phone || "—"}</a>
              </td>
              <td>{l.service || "—"}</td>
              <td className="admin-msg">{l.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
      return resolve(file);
    }
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width <= maxWidth && height <= maxHeight && file.size < 500 * 1024) {
            return resolve(file);
          }
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);

          const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const optimized = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, outputType === "image/png" ? ".png" : ".jpg"),
                { type: outputType, lastModified: Date.now() }
              );
              resolve(optimized);
            },
            outputType,
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}

function AdminGalleryManager({ photos, onAddPhoto, onDeletePhoto, deletingId }) {
  const [mode, setMode] = useState("file"); // "file" | "url"
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Office");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Search & Filter in Admin
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErr("Image file size exceeds 15 MB limit.");
      return;
    }
    setErr(null);
    try {
      const optimized = await compressImageFile(file);
      setSelectedFile(optimized);
      setPreview(URL.createObjectURL(optimized));
    } catch {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id, photoTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${photoTitle || "this photo"}" from the gallery?`)) {
      return;
    }
    setMsg(null);
    setErr(null);
    try {
      await onDeletePhoto(id);
      setMsg(`Photo "${photoTitle || id}" deleted successfully from gallery & database.`);
      setTimeout(() => setMsg(null), 4000);
    } catch (e) {
      setErr(e.message || "Failed to delete photo.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);

    if (!title.trim()) {
      setErr("Photo title is required.");
      return;
    }

    if (mode === "file" && !selectedFile) {
      setErr("Please select or drop an image file to upload.");
      return;
    }

    if (mode === "url" && !imageUrl.trim()) {
      setErr("Please enter a valid image URL.");
      return;
    }

    setSubmitting(true);
    try {
      let payload;
      if (mode === "file" && selectedFile) {
        payload = new FormData();
        payload.append("title", title.trim());
        payload.append("category", category);
        payload.append("date", date);
        payload.append("description", description.trim());
        payload.append("image", selectedFile);
      } else {
        payload = {
          title: title.trim(),
          category,
          date,
          description: description.trim(),
          imageUrl: imageUrl.trim(),
        };
      }

      await onAddPhoto(payload);
      setMsg("Photo successfully published to live gallery!");
      setTitle("");
      setDescription("");
      clearSelection();
    } catch (error) {
      setErr(error.message || "Failed to post photo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered photos in admin
  const filteredPhotos = (photos || []).filter((p) => {
    const matchesCat = filterCat === "All" || (p.category || "").toLowerCase() === filterCat.toLowerCase();
    const matchesSearch = !search.trim() || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="admin-gallery-wrap">
      {/* Upload Form Card */}
      <div className="admin-gallery-form-card">
        <div className="admin-gallery-header-row">
          <div>
            <h3>
              <i className="bi bi-cloud-arrow-up-fill text-primary"></i> Post New Photo to Gallery
            </h3>
            <p>
              Upload high-resolution corporate photos, workspace memories, team milestones, and event highlights to the website.
            </p>
          </div>
          <Link to="/gallery" target="_blank" className="btn btn-outline btn-sm">
            <i className="bi bi-box-arrow-up-right me-1"></i> View Live Gallery
          </Link>
        </div>

        {msg && (
          <div className="banner ok" style={{ marginBottom: 20 }}>
            <i className="bi bi-check-circle-fill me-2"></i> {msg}
          </div>
        )}
        {err && (
          <div className="banner err" style={{ marginBottom: 20 }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-gallery-grid-2">
            {/* Left Column: Metadata */}
            <div>
              <div className="admin-field-group">
                <label className="admin-label">
                  <i className="bi bi-fonts text-primary"></i> Photo Title *
                </label>
                <div className="admin-input-wrap">
                  <i className="bi bi-card-text"></i>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. Annual Tech Symposium 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="admin-field-group">
                  <label className="admin-label">
                    <i className="bi bi-tags-fill text-primary"></i> Category
                  </label>
                  <div className="admin-input-wrap">
                    <i className="bi bi-folder2-open"></i>
                    <select
                      className="admin-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Office">Office</option>
                      <option value="Team">Team</option>
                      <option value="Events">Events</option>
                      <option value="Workspace">Workspace</option>
                      <option value="Celebrations">Celebrations</option>
                      <option value="Achievements">Achievements</option>
                      <option value="Training">Training</option>
                      <option value="Projects">Projects</option>
                    </select>
                  </div>
                </div>

                <div className="admin-field-group">
                  <label className="admin-label">
                    <i className="bi bi-calendar3 text-primary"></i> Event Date
                  </label>
                  <div className="admin-input-wrap">
                    <i className="bi bi-calendar-event"></i>
                    <input
                      type="date"
                      className="admin-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-field-group">
                <label className="admin-label">
                  <i className="bi bi-chat-square-quote text-primary"></i> Caption / Description (Optional)
                </label>
                <div className="admin-input-wrap">
                  <i className="bi bi-chat-left-text"></i>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Brief summary or context about this photo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-field-group">
                <label className="admin-label">
                  <i className="bi bi-sliders text-primary"></i> Image Source
                </label>
                <div className="admin-mode-pills">
                  <button
                    type="button"
                    className={`admin-mode-pill ${mode === "file" ? "active" : ""}`}
                    onClick={() => {
                      setMode("file");
                      clearSelection();
                    }}
                  >
                    <i className="bi bi-upload"></i> Upload Image File
                  </button>
                  <button
                    type="button"
                    className={`admin-mode-pill ${mode === "url" ? "active" : ""}`}
                    onClick={() => {
                      setMode("url");
                      clearSelection();
                    }}
                  >
                    <i className="bi bi-link-45deg"></i> Use Web Image URL
                  </button>
                </div>

                {mode === "url" && (
                  <div className="admin-input-wrap">
                    <i className="bi bi-globe2"></i>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://example.com/photo.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreview(e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Visual Dropzone / Live Preview */}
            <div>
              <label className="admin-label">
                <i className="bi bi-image text-primary"></i> Photo Preview &amp; Upload
              </label>

              {preview ? (
                <div className="admin-preview-card">
                  <div className="admin-preview-img-wrap">
                    <img src={preview} alt="Upload preview" className="admin-preview-img" />
                    <span className="admin-preview-badge">{category}</span>
                  </div>
                  <div className="admin-preview-bar">
                    <span className="admin-preview-filename">
                      {selectedFile ? selectedFile.name : (imageUrl || "Web Image")}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm text-danger"
                      onClick={clearSelection}
                      style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                    >
                      <i className="bi bi-x-circle me-1"></i> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`admin-dropzone ${isDragging ? "dragover" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div className="admin-dropzone-icon">
                    <i className="bi bi-cloud-arrow-up"></i>
                  </div>
                  <h4>Drag &amp; drop photo here</h4>
                  <p>or click anywhere to browse from your computer</p>
                  <div className="admin-dropzone-tags">
                    <span className="admin-dropzone-tag">JPG</span>
                    <span className="admin-dropzone-tag">PNG</span>
                    <span className="admin-dropzone-tag">WEBP</span>
                    <span className="admin-dropzone-tag">GIF</span>
                    <span className="admin-dropzone-tag">Up to 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="admin-publish-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span> Publishing to Gallery...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-check-fill"></i> Post Photo to Gallery
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Photos List & Management */}
      <div>
        <div className="admin-gallery-toolbar">
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              <i className="bi bi-images me-2 text-primary"></i> Current Gallery Photos ({photos ? photos.length : 0})
            </h3>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {/* Search Box */}
            <div className="admin-search-wrap">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search photos by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="admin-select"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              style={{ width: "auto", padding: "8px 14px", height: "auto" }}
            >
              <option value="All">All Categories</option>
              <option value="Office">Office</option>
              <option value="Team">Team</option>
              <option value="Events">Events</option>
              <option value="Workspace">Workspace</option>
              <option value="Celebrations">Celebrations</option>
              <option value="Achievements">Achievements</option>
              <option value="Training">Training</option>
              <option value="Projects">Projects</option>
            </select>
          </div>
        </div>

        {!filteredPhotos || filteredPhotos.length === 0 ? (
          <div className="admin-empty">
            <i className="bi bi-images"></i> No photos found. Post a new photo using the form above!
          </div>
        ) : (
          <div className="admin-photo-grid">
            {filteredPhotos.map((item) => (
              <div key={item.id} className="admin-photo-card">
                <div className="admin-photo-img-wrap">
                  <img src={item.imageUrl} alt={item.title} className="admin-photo-img" />
                  <span className="gallery-badge">{item.category}</span>
                </div>
                <div className="admin-photo-body">
                  <h4 className="admin-photo-title">{item.title}</h4>
                  {item.description && <p className="admin-photo-desc">{item.description}</p>}
                  <div className="admin-photo-footer">
                    <span className="admin-photo-date">
                      <i className="bi bi-calendar3 me-1"></i> {item.date || "—"}
                    </span>
                    <button
                      className="admin-del-btn"
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deletingId === item.id}
                      title="Delete photo"
                    >
                      {deletingId === item.id ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <>
                          <i className="bi bi-trash3"></i> Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: OFFER LETTER SENDER & HISTORY
// ============================================================
const ROLE_PRESETS = [
  "Full Stack Web Developer Intern",
  "Frontend React Developer Intern",
  "Python & AI Intern",
  "Node.js Backend Developer Intern",
  "UI/UX Designer Intern",
  "Mobile App Developer Intern",
  "Data Science & Analytics Intern",
  "Software Engineering Intern",
];

const FIELD_PRESETS = [
  "Web Development & Coding",
  "Full Stack Web Development",
  "Frontend Architecture & UI",
  "Python & Machine Learning",
  "Backend & API Engineering",
  "Mobile App Development",
  "UI/UX & Product Design",
  "Software Quality & Testing",
];

function formatOfferDisplayDate(dStr) {
  if (!dStr) return "—";
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dStr;
  }
}

function AdminOfferSender({
  offers = [],
  onSendOffer,
  onDeleteOffer,
  deletingId,
  prefill,
  onClearPrefill,
}) {
  const getToday = () => new Date().toISOString().slice(0, 10);
  const getThreeMonthsLater = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  };

  const [salutation, setSalutation] = useState("Mr./Ms.");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [role, setRole] = useState("Full Stack Web Developer Intern");
  const [field, setField] = useState("Web Development & Coding");
  const [startDate, setStartDate] = useState(getToday);
  const [endDate, setEndDate] = useState(getThreeMonthsLater);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [viewModalOffer, setViewModalOffer] = useState(null);

  useEffect(() => {
    if (prefill) {
      if (prefill.candidateName) setCandidateName(prefill.candidateName);
      if (prefill.candidateEmail) setCandidateEmail(prefill.candidateEmail);
      if (prefill.role) setRole(prefill.role);
      if (prefill.field) setField(prefill.field);
      setSuccessMsg("Candidate details pre-filled from internship application!");
      const timer = setTimeout(() => setSuccessMsg(""), 4500);
      onClearPrefill?.();
      return () => clearTimeout(timer);
    }
  }, [prefill, onClearPrefill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!candidateName.trim()) {
      setErrorMsg("Candidate name is required.");
      return;
    }
    if (!candidateEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)) {
      setErrorMsg("Please enter a valid candidate email address.");
      return;
    }
    if (!role.trim()) {
      setErrorMsg("Internship role is required.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg("Both start date and end date are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSendOffer({
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        salutation,
        role: role.trim(),
        field: (field || role).trim(),
        startDate,
        endDate,
      });

      setSuccessMsg(res?.message || `Offer letter successfully emailed to ${candidateEmail}!`);
      setCandidateName("");
      setCandidateEmail("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to send offer letter. Please verify SMTP settings.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseAsTemplate = (item) => {
    if (item.salutation) setSalutation(item.salutation);
    if (item.candidateName) setCandidateName(item.candidateName);
    if (item.candidateEmail) setCandidateEmail(item.candidateEmail);
    if (item.role) setRole(item.role);
    if (item.field) setField(item.field);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };

  const filteredOffers = (offers || []).filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (o.candidateName && o.candidateName.toLowerCase().includes(q)) ||
      (o.candidateEmail && o.candidateEmail.toLowerCase().includes(q)) ||
      (o.role && o.role.toLowerCase().includes(q)) ||
      (o.refId && o.refId.toLowerCase().includes(q))
    );
  });

  const displayStart = formatOfferDisplayDate(startDate) || "[Start Date]";
  const displayEnd = formatOfferDisplayDate(endDate) || "[End Date]";
  const displayName = candidateName.trim() || "[Candidate Name]";
  const displayRole = role.trim() || "[Role]";
  const displayField = (field.trim() || displayRole);

  return (
    <div className="admin-offer-wrap">
      {/* Top Banner / Info */}
      <div className="admin-offer-card">
        <div className="admin-gallery-header-row">
          <div>
            <h3>
              <i className="bi bi-file-earmark-check text-primary"></i> Internship Offer & Confirmation Sender
            </h3>
            <p>
              Send professional, branded offer letters to shortlisted candidates with one click. Emails are dispatched instantly with company styling and delivery history is archived below.
            </p>
          </div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill">
            <i className="bi bi-award me-1"></i> Official Automated Dispatch
          </span>
        </div>

        {successMsg && (
          <div className="banner ok" style={{ marginBottom: 20 }}>
            <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="banner warn" style={{ marginBottom: 20 }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMsg}
          </div>
        )}

        <div className="admin-offer-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                  Salutation
                </label>
                <select
                  className="form-control"
                  value={salutation}
                  onChange={(e) => setSalutation(e.target.value)}
                >
                  <option value="Mr./Ms.">Mr./Ms.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                  Candidate Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                Candidate Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="candidate@gmail.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
              />
              <small className="text-muted" style={{ fontSize: "11.5px" }}>
                The official offer letter email will be dispatched to this address.
              </small>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                Internship Role / Designation <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Full Stack Web Developer Intern"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
              <div className="admin-preset-pills">
                {ROLE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`admin-preset-pill ${role === p ? "active" : ""}`}
                    onClick={() => {
                      setRole(p);
                      if (!field || field === "Web Development & Coding") {
                        const matched = FIELD_PRESETS.find((f) =>
                          p.toLowerCase().includes("python")
                            ? f.includes("Python")
                            : p.toLowerCase().includes("react")
                            ? f.includes("Frontend")
                            : p.toLowerCase().includes("ui")
                            ? f.includes("UI/UX")
                            : false
                        );
                        if (matched) setField(matched);
                      }
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                Field / Domain Contribution <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Web Development & Coding"
                value={field}
                onChange={(e) => setField(e.target.value)}
                required
              />
              <div className="admin-preset-pills">
                {FIELD_PRESETS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`admin-preset-pill ${field === f ? "active" : ""}`}
                    onClick={() => setField(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                  Internship Start Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: "13px" }}>
                  Internship End Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 1, padding: "12px 20px" }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Sending Offer Letter...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-2"></i> Send Offer Letter
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setCandidateName("");
                  setCandidateEmail("");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                Clear
              </button>
            </div>
          </form>

          {/* Live Preview Paper */}
          <div className="admin-offer-preview-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong style={{ fontSize: "13px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                <i className="bi bi-eye me-1 text-primary"></i> Live Email Preview
              </strong>
              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "11px" }}>
                Auto-updated
              </span>
            </div>

            <div className="admin-offer-letter-paper">
              <div className="admin-offer-paper-header">
                <h4>TREND CODE TECHNOLOGY</h4>
                <p>Official Internship Offer & Confirmation</p>
              </div>

              <div className="admin-offer-meta-row">
                <span>Ref: <strong style={{ color: "#0f172a" }}>TCT/INT/2026/PROV</strong></span>
                <span>Date: <strong style={{ color: "#0f172a" }}>{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</strong></span>
              </div>

              <div className="admin-offer-letter-body">
                <p>
                  <strong>Dear {salutation} {displayName},</strong>
                </p>

                <p>
                  We are pleased to confirm your position as a &ldquo;<strong>{displayRole}</strong>&rdquo; at &ldquo;<strong>TREND CODE TECHNOLOGY</strong>&rdquo;. Your internship began on <strong>{displayStart}</strong> to <strong>{displayEnd}</strong> and is currently ongoing.
                </p>

                <p>
                  During this internship, you are expected to contribute to <strong>{displayField}</strong> tasks, assist in coding and debugging activities, and support project requirements as assigned. This internship is designed to enhance your technical skills and provide valuable hands-on industry experience.
                </p>

                <p>
                  We appreciate your contribution so far and look forward to your continued dedication and learning.
                </p>

                <div className="admin-offer-paper-summary">
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Position</span><br />
                    <strong>{displayRole}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Domain / Field</span><br />
                    <strong>{displayField}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Duration</span><br />
                    <strong>{displayStart} &mdash; {displayEnd}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Status</span><br />
                    <span className="text-success fw-bold">Active · Ongoing</span>
                  </div>
                </div>

                <div className="admin-offer-paper-sign">
                  <div>Warm regards,</div>
                  <strong>HR & Talent Operations</strong><br />
                  <span style={{ color: "#0d6efd", fontWeight: 600 }}>Trend Code Technology</span><br />
                  <span>Ganapathy, Coimbatore — 641006 · +91 93848 47922</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sent History Table */}
      <div className="admin-offer-card">
        <div className="admin-gallery-toolbar" style={{ marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
              <i className="bi bi-clock-history text-primary me-2"></i> Sent Offer Letters History
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Archived records of all letters delivered to candidates ({offers.length} total)
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}></i>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search candidate or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, width: 240 }}
              />
            </div>
          </div>
        </div>

        {!filteredOffers.length ? (
          <div className="admin-empty">
            <i className="bi bi-envelope-paper"></i> No offer letters recorded yet. Send your first letter above!
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sent Date</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Role & Domain</th>
                  <th>Internship Period</th>
                  <th>Ref ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((o) => (
                  <tr key={o.id}>
                    <td className="admin-date">{fmtDate(o.createdAt)}</td>
                    <td>
                      <strong>{o.salutation || ""} {o.candidateName}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${o.candidateEmail}`}>{o.candidateEmail}</a>
                    </td>
                    <td>
                      <strong>{o.role}</strong>
                      {o.field && <p className="admin-note" style={{ margin: "2px 0 0" }}>{o.field}</p>}
                    </td>
                    <td>
                      <span className="admin-note">
                        {o.startDate} &mdash; {o.endDate}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
                        {o.refId || "—"}
                      </code>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill">
                        <i className="bi bi-check2-circle me-1"></i> {o.status || "Sent"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => setViewModalOffer(o)}
                          title="View Full Offer Letter"
                        >
                          <i className="bi bi-eye"></i> View
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => handleUseAsTemplate(o)}
                          title="Load Details into Form"
                        >
                          <i className="bi bi-pencil-square"></i> Use
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm text-danger"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          disabled={deletingId === o.id}
                          onClick={() => onDeleteOffer(o.id)}
                          title="Delete Record"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Offer Letter */}
      {viewModalOffer && (
        <div className="admin-modal-overlay" onClick={() => setViewModalOffer(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                <i className="bi bi-file-earmark-check text-primary me-2"></i>
                Offer Letter &mdash; {viewModalOffer.candidateName}
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={() => setViewModalOffer(null)}
                aria-label="Close"
              ></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-offer-letter-paper" style={{ border: "1px solid #cbd5e1" }}>
                <div className="admin-offer-paper-header">
                  <h4>TREND CODE TECHNOLOGY</h4>
                  <p>Official Internship Offer & Confirmation</p>
                </div>

                <div className="admin-offer-meta-row">
                  <span>Ref: <strong style={{ color: "#0f172a" }}>{viewModalOffer.refId || "TCT/INT/2026"}</strong></span>
                  <span>Sent On: <strong style={{ color: "#0f172a" }}>{fmtDate(viewModalOffer.createdAt)}</strong></span>
                </div>

                <div className="admin-offer-letter-body">
                  <p>
                    <strong>Dear {viewModalOffer.salutation || "Mr./Ms."} {viewModalOffer.candidateName},</strong>
                  </p>

                  <p>
                    We are pleased to confirm your position as a &ldquo;<strong>{viewModalOffer.role}</strong>&rdquo; at &ldquo;<strong>TREND CODE TECHNOLOGY</strong>&rdquo;. Your internship began on <strong>{viewModalOffer.startDate}</strong> to <strong>{viewModalOffer.endDate}</strong> and is currently ongoing.
                  </p>

                  <p>
                    During this internship, you are expected to contribute to <strong>{viewModalOffer.field}</strong> tasks, assist in coding and debugging activities, and support project requirements as assigned. This internship is designed to enhance your technical skills and provide valuable hands-on industry experience.
                  </p>

                  <p>
                    We appreciate your contribution so far and look forward to your continued dedication and learning.
                  </p>

                  <div className="admin-offer-paper-summary">
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Position</span><br />
                      <strong>{viewModalOffer.role}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Domain</span><br />
                      <strong>{viewModalOffer.field}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Period</span><br />
                      <strong>{viewModalOffer.startDate} &mdash; {viewModalOffer.endDate}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Recipient</span><br />
                      <strong>{viewModalOffer.candidateEmail}</strong>
                    </div>
                  </div>

                  <div className="admin-offer-paper-sign">
                    <div>Warm regards,</div>
                    <strong>HR & Talent Operations</strong><br />
                    <span style={{ color: "#0d6efd", fontWeight: 600 }}>Trend Code Technology</span><br />
                    <span>Ganapathy, Coimbatore — 641006 · +91 93848 47922</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-1"></i> Print / Save PDF
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewModalOffer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  // Start locked; only a successful server check unlocks the dashboard.
  // (Trusting localStorage alone let anyone with devtools open /admin.)
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("applications");
  const [apps, setApps] = useState(null);
  const [leads, setLeads] = useState(null);
  const [authlog, setAuthlog] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [revoking, setRevoking] = useState("");
  const [interns, setInterns] = useState(null);
  const [tours, setTours] = useState(null);
  const [deletingTour, setDeletingTour] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState("");
  const [offers, setOffers] = useState(null);
  const [deletingOfferId, setDeletingOfferId] = useState("");
  const [offerPrefill, setOfferPrefill] = useState(null);
  const [ads, setAds] = useState(null);
  const [deletingAdId, setDeletingAdId] = useState("");
  const [error, setError] = useState("");
  const [dbWarn, setDbWarn] = useState("");
  const [checkErr, setCheckErr] = useState("");

  const load = () => {
    setError("");
    // Every request must settle: a failed fetch shows the error banner and
    // empties the table instead of leaving "Loading…" on screen forever.
    const fail = (setter) => (e) => {
      setter([]);
      setError((prev) => prev || e.message || "Could not load data from the server.");
    };
    getApplications().then(setApps).catch(fail(setApps));
    getLeads().then(setLeads).catch(fail(setLeads));
    getAuthLog().then(setAuthlog).catch(fail(setAuthlog));
    getSessions().then(setSessions).catch(fail(setSessions));
    getInternships().then(setInterns).catch(fail(setInterns));
    getTourEnquiries().then(setTours).catch(fail(setTours));
    getGallery().then(setGalleryPhotos).catch(fail(setGalleryPhotos));
    getOffers().then(setOffers).catch(fail(setOffers));
    getAdminAds().then(setAds).catch(fail(setAds));
    // Warn (don't block) when the database is not actually connected — that is
    // why freshly submitted records can vanish from this page.
    getHealth()
      .then((h) =>
        setDbWarn(
          h && h.db === "connected"
            ? ""
            : `Database is not connected (${(h && h.db) || "unknown"}). New submissions are stored temporarily and may disappear.`
        )
      )
      .catch(() => setDbWarn(""));
  };

  // Verify the saved token against the server before showing anything.
  useEffect(() => {
    let alive = true;
    const saved = getSavedUser();
    if (!saved) {
      setChecking(false);
      return;
    }
    getApplications()
      .then(() => {
        if (alive) {
          setUser(saved);
          setChecking(false);
          load();
        }
      })
      .catch((e) => {
        if (alive) {
          // 401 = expired token (already cleared). Anything else means the
          // server itself is unreachable — say so instead of silently
          // bouncing the user to the sign-in screen.
          if (!e.status || e.status >= 500) setCheckErr(e.message || "");
          clearSession();
          setChecking(false);
        }
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeTour = (id) => {
    setDeletingTour(id);
    deleteTourEnquiry(id)
      .then(() => setTours((prev) => (prev || []).filter((t) => t.id !== id)))
      .catch((e) => setError(e.message))
      .finally(() => setDeletingTour(""));
  };

  const handleAddPhoto = async (payload) => {
    const res = await postGalleryPhoto(payload);
    if (res && res.item) {
      setGalleryPhotos((prev) => [res.item, ...(prev || [])]);
    }
    return res;
  };

  const handleDeletePhoto = async (id) => {
    setDeletingPhotoId(id);
    setError("");
    try {
      await deleteGalleryPhoto(id);
      setGalleryPhotos((prev) => (prev || []).filter((p) => String(p.id || p._id || "").trim() !== String(id).trim()));
      return true;
    } catch (e) {
      setError(e.message || "Failed to delete photo.");
      throw e;
    } finally {
      setDeletingPhotoId("");
    }
  };

  const handleSendOffer = async (payload) => {
    const res = await postSendOffer(payload);
    if (res && res.offer) {
      setOffers((prev) => [res.offer, ...(prev || []).filter((o) => o.id !== res.offer.id)]);
    }
    return res;
  };

  const handleDeleteOffer = (id) => {
    if (window.confirm("Are you sure you want to remove this offer letter from history?")) {
      setDeletingOfferId(id);
      deleteOffer(id)
        .then(() => setOffers((prev) => (prev || []).filter((o) => String(o.id || o._id || "").trim() !== String(id).trim())))
        .catch((e) => setError(e.message))
        .finally(() => setDeletingOfferId(""));
    }
  };

  const handlePrepareOfferFromIntern = (intern) => {
    setOfferPrefill({
      candidateName: intern.name,
      candidateEmail: intern.email,
      role: intern.domain ? `${intern.domain} Intern` : "Software Developer Intern",
      field: intern.domain || "Web Development & Coding",
    });
    setTab("offers");
  };

  const handleAddAd = async (payload) => {
    const res = await postAdminAd(payload);
    if (res && res.item) {
      setAds((prev) => [res.item, ...(prev || [])]);
    }
    return res;
  };

  const handleUpdateAd = async (id, payload) => {
    const res = await putAdminAd(id, payload);
    if (res && res.item) {
      setAds((prev) => (prev || []).map((a) => (a.id === id ? res.item : a)));
    }
    return res;
  };

  const handleToggleAd = async (id) => {
    const res = await toggleAdminAd(id);
    if (res && res.item) {
      setAds((prev) => (prev || []).map((a) => (a.id === id ? res.item : a)));
    }
    return res;
  };

  const handleDeleteAd = async (id) => {
    setDeletingAdId(id);
    try {
      await deleteAdminAd(id);
      setAds((prev) => (prev || []).filter((a) => a.id !== id));
    } finally {
      setDeletingAdId("");
    }
  };

  const signOut = () => {
    postLogout().catch(() => {}); // record logout event server-side
    clearSession();
    setUser(null);
  };

  const revokeSession = (tokenPreview) => {
    setRevoking(tokenPreview);
    postRevokeSession(tokenPreview)
      .then(() => {
        setSessions((prev) => (prev || []).filter((s) => s.tokenPreview !== tokenPreview));
        getAuthLog().then(setAuthlog).catch(() => {}); // refresh activity log
      })
      .catch((e) => setError(e.message))
      .finally(() => setRevoking(""));
  };

  if (checking) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="admin-empty">
            <i className="bi bi-hourglass-split"></i> Checking session…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section admin-guard">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="info-card" style={{ maxWidth: 520, margin: "0 auto" }}>
            <div className="icon" style={{ margin: "0 auto 14px" }}>
              <i className="bi bi-shield-lock"></i>
            </div>
            {/* The only public view of /admin — it must own the page <h1>.
                Inline fontSize keeps the old <h2> look exactly. */}
            <h1 style={{ marginBottom: 8, fontSize: "1.5rem" }}>Admin area</h1>
            <p style={{ color: "var(--muted)", marginBottom: 22 }}>
              Please sign in with the admin account to view job applications
              and enquiries.
            </p>
            {checkErr && (
              <div className="banner err" style={{ marginBottom: 22, textAlign: "left" }}>
                <i className="bi bi-exclamation-triangle me-1"></i> {checkErr}
              </div>
            )}
            <Link to="/login" className="btn btn-primary btn-lg">
              Go to Sign In <i className="bi bi-box-arrow-in-right"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="TCT Admin"
        title="Applications & Enquiries"
        text="Signed in as admin — review job applicants, download resumes and read website enquiries."
        crumb="Admin"
      />

      <section className="section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="admin-bar">
            <div className="tech-tabs" role="tablist" style={{ margin: 0 }}>
              <button
                role="tab"
                aria-selected={tab === "applications"}
                className={`tech-tab ${tab === "applications" ? "active" : ""}`}
                onClick={() => setTab("applications")}
              >
                <i className="bi bi-briefcase me-1"></i> Job Applications
                {apps && <span className="admin-count">{apps.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "leads"}
                className={`tech-tab ${tab === "leads" ? "active" : ""}`}
                onClick={() => setTab("leads")}
              >
                <i className="bi bi-envelope me-1"></i> Quote Enquiries
                {leads && <span className="admin-count">{leads.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "interns"}
                className={`tech-tab ${tab === "interns" ? "active" : ""}`}
                onClick={() => setTab("interns")}
              >
                <i className="bi bi-mortarboard me-1"></i> Internships
                {interns && <span className="admin-count">{interns.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "tours"}
                className={`tech-tab ${tab === "tours" ? "active" : ""}`}
                onClick={() => setTab("tours")}
              >
                <i className="bi bi-airplane-engines me-1"></i> Tour Enquiries
                {tours && <span className="admin-count">{tours.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "gallery"}
                className={`tech-tab ${tab === "gallery" ? "active" : ""}`}
                onClick={() => setTab("gallery")}
              >
                <i className="bi bi-images me-1"></i> Photo Gallery
                {galleryPhotos && <span className="admin-count">{galleryPhotos.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "offers"}
                className={`tech-tab ${tab === "offers" ? "active" : ""}`}
                onClick={() => setTab("offers")}
              >
                <i className="bi bi-file-earmark-check me-1"></i> Offer Sender
                {offers && <span className="admin-count">{offers.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "ads"}
                className={`tech-tab ${tab === "ads" ? "active" : ""}`}
                onClick={() => setTab("ads")}
              >
                <i className="bi bi-megaphone me-1"></i> Advertisements & Popups
                {ads && <span className="admin-count">{ads.length}</span>}
              </button>
              <button
                role="tab"
                aria-selected={tab === "authlog"}
                className={`tech-tab ${tab === "authlog" ? "active" : ""}`}
                onClick={() => setTab("authlog")}
              >
                <i className="bi bi-clock-history me-1"></i> Login Activity
              </button>
            </div>
            <div className="admin-bar-actions">
              <button className="btn btn-outline btn-sm" onClick={load}>
                <i className="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button className="btn btn-outline btn-sm" onClick={signOut}>
                <i className="bi bi-box-arrow-right"></i> Sign out
              </button>
            </div>
          </div>

          {error && (
            <div className="banner err" style={{ marginBottom: 16 }}>
              <i className="bi bi-exclamation-triangle me-1"></i> {error}
            </div>
          )}

          {dbWarn && (
            <div className="banner warn" style={{ marginBottom: 16 }}>
              <i className="bi bi-database-exclamation me-1"></i> {dbWarn}
            </div>
          )}

          {tab === "applications" ? (
            apps === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <ApplicationsTable rows={apps} />
            )
          ) : tab === "leads" ? (
            leads === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <LeadsTable rows={leads} />
            )
          ) : tab === "interns" ? (
            interns === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <InternshipsTable rows={interns} onPrepareOffer={handlePrepareOfferFromIntern} />
            )
          ) : tab === "tours" ? (
            tours === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <TourEnquiriesTable
                rows={tours}
                onDelete={removeTour}
                busyId={deletingTour}
              />
            )
          ) : tab === "gallery" ? (
            galleryPhotos === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <AdminGalleryManager
                photos={galleryPhotos}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
                deletingId={deletingPhotoId}
              />
            )
          ) : tab === "offers" ? (
            offers === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <AdminOfferSender
                offers={offers}
                onSendOffer={handleSendOffer}
                onDeleteOffer={handleDeleteOffer}
                deletingId={deletingOfferId}
                prefill={offerPrefill}
                onClearPrefill={() => setOfferPrefill(null)}
              />
            )
          ) : tab === "ads" ? (
            ads === null ? (
              <div className="admin-empty">
                <i className="bi bi-hourglass-split"></i> Loading…
              </div>
            ) : (
              <AdminAdsManager
                ads={ads}
                onAddAd={handleAddAd}
                onUpdateAd={handleUpdateAd}
                onToggleAd={handleToggleAd}
                onDeleteAd={handleDeleteAd}
                deletingId={deletingAdId}
              />
            )
          ) : authlog === null ? (
            <div className="admin-empty">
              <i className="bi bi-hourglass-split"></i> Loading…
            </div>
          ) : (
            <>
              <h3 className="careers-col-title" style={{ fontSize: "1.05rem", marginTop: 6 }}>
                <i className="bi bi-hdd-network"></i> Active Sessions
              </h3>
              {sessions === null ? (
                <div className="admin-empty">
                  <i className="bi bi-hourglass-split"></i> Loading…
                </div>
              ) : (
                <SessionsPanel
                  sessions={sessions}
                  onRevoke={revokeSession}
                  busyPreview={revoking}
                />
              )}

              <h3 className="careers-col-title" style={{ fontSize: "1.05rem", marginTop: 26 }}>
                <i className="bi bi-clock-history"></i> Login Activity
              </h3>
              <AuthLogTable rows={authlog} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
