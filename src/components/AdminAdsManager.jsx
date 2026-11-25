import { useState, useMemo } from "react";

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  badge: "SPECIAL PROMOTION",
  placement: "popup", // 'popup' | 'floating' | 'topbar'
  targetPage: "all", // 'all' | '/' | '/internship' | '/careers' | '/services' | '/contact'
  ctaText: "Apply Now",
  ctaLink: "/internship",
  secondaryText: "Close",
  secondaryLink: "",
  delaySeconds: 2,
  active: true,
  imageUrl: "",
  isPoster: false, // true = Custom Poster Ad (முழு போஸ்டர் விளம்பரம்), false = Standard Card Ad
  posterFit: "contain", // 'contain' | 'cover'
};

export default function AdminAdsManager({
  ads,
  onAddAd,
  onUpdateAd,
  onToggleAd,
  onDeleteAd,
  deletingId,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState("");
  const [filterPlacement, setFilterPlacement] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPage, setFilterPage] = useState("all");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [testPreviewAd, setTestPreviewAd] = useState(null);

  const setF = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [k]: val }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleStartEdit = (ad) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title || "",
      subtitle: ad.subtitle || "",
      badge: ad.badge || "PROMOTION",
      placement: ad.placement || "popup",
      targetPage: ad.targetPage || "all",
      ctaText: ad.ctaText || "Apply Now",
      ctaLink: ad.ctaLink || "/internship",
      secondaryText: ad.secondaryText || "Close",
      secondaryLink: ad.secondaryLink || "",
      delaySeconds: typeof ad.delaySeconds !== "undefined" ? ad.delaySeconds : 2,
      active: ad.active !== false,
      imageUrl: ad.imageUrl || "",
      isPoster: ad.isPoster === true || ad.isPoster === "true",
      posterFit: ad.posterFit || "contain",
    });
    setPreviewUrl(ad.imageUrl || "");
    setFile(null);
    setFormOpen(true);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFile(null);
    setPreviewUrl("");
    setFormOpen(false);
    setMsg({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMsg({ type: "err", text: "Please enter an advertisement title." });
      return;
    }

    setSaving(true);
    setMsg({ type: "", text: "" });

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "imageUrl" || !file) {
          fd.append(k, v);
        }
      });
      if (file) {
        fd.append("image", file);
      } else if (form.imageUrl) {
        fd.append("imageUrl", form.imageUrl);
      }

      if (editingId) {
        await onUpdateAd(editingId, fd);
        setMsg({ type: "ok", text: "Advertisement updated successfully!" });
      } else {
        await onAddAd(fd);
        setMsg({ type: "ok", text: "Advertisement created & published successfully!" });
      }

      handleCancelEdit();
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Failed to save advertisement." });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await onToggleAd(id);
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    } finally {
      setTogglingId("");
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await onDeleteAd(id);
      if (editingId === id) handleCancelEdit();
    } catch (err) {
      alert("Failed to delete ad: " + err.message);
    }
  };

  // Filtered ads list
  const filteredAds = useMemo(() => {
    if (!ads) return [];
    return ads.filter((a) => {
      if (filterPlacement !== "all" && a.placement !== filterPlacement) return false;
      if (filterStatus === "active" && a.active === false) return false;
      if (filterStatus === "paused" && a.active !== false) return false;
      if (filterPage !== "all") {
        if (filterPage === "global" && a.targetPage !== "all") return false;
        if (filterPage !== "global" && a.targetPage !== filterPage) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.title?.toLowerCase().includes(q) ||
          a.subtitle?.toLowerCase().includes(q) ||
          a.badge?.toLowerCase().includes(q) ||
          a.targetPage?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ads, filterPlacement, filterStatus, filterPage, search]);

  // Metric counts
  const stats = useMemo(() => {
    if (!ads) return { total: 0, active: 0, popup: 0, floating: 0, topbar: 0 };
    return {
      total: ads.length,
      active: ads.filter((a) => a.active !== false).length,
      popup: ads.filter((a) => a.placement === "popup").length,
      floating: ads.filter((a) => a.placement === "floating").length,
      topbar: ads.filter((a) => a.placement === "topbar").length,
    };
  }, [ads]);

  return (
    <div className="admin-ad-manager-wrap">
      {/* Top Banner & Stats */}
      <div className="admin-ad-header-row">
        <div>
          <h2 style={{ fontSize: "1.35rem", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            <i className="bi bi-megaphone-fill text-primary"></i> Advertisements & Promotion Popups
          </h2>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Control where, when and how promotional popups, floating cards and top bars appear to visitors.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className={`btn ${formOpen ? "btn-outline" : "btn-primary"}`}
            onClick={() => {
              if (formOpen) handleCancelEdit();
              else {
                setForm(INITIAL_FORM);
                setEditingId(null);
                setFile(null);
                setPreviewUrl("");
                setFormOpen(true);
              }
            }}
          >
            <i className={`bi ${formOpen ? "bi-x-lg" : "bi-plus-lg"} me-1`}></i>
            {formOpen ? "Close Form" : "Create New Ad"}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="admin-ad-stats-row">
        <div className="admin-ad-stat-box">
          <div className="admin-ad-stat-val">{stats.total}</div>
          <div className="admin-ad-stat-lbl"><i className="bi bi-collection me-1"></i> Total Ads</div>
        </div>
        <div className="admin-ad-stat-box green">
          <div className="admin-ad-stat-val">{stats.active}</div>
          <div className="admin-ad-stat-lbl"><i className="bi bi-check-circle-fill me-1"></i> Active / Live</div>
        </div>
        <div className="admin-ad-stat-box blue">
          <div className="admin-ad-stat-val">{stats.popup}</div>
          <div className="admin-ad-stat-lbl"><i className="bi bi-window-stack me-1"></i> Center Modals</div>
        </div>
        <div className="admin-ad-stat-box orange">
          <div className="admin-ad-stat-val">{stats.floating}</div>
          <div className="admin-ad-stat-lbl"><i className="bi bi-card-heading me-1"></i> Floating Side</div>
        </div>
        <div className="admin-ad-stat-box purple">
          <div className="admin-ad-stat-val">{stats.topbar}</div>
          <div className="admin-ad-stat-lbl"><i className="bi bi-view-stacked me-1"></i> Top Bars</div>
        </div>
      </div>

      {/* Alert Messages */}
      {msg.text && (
        <div className={`banner ${msg.type === "ok" ? "ok" : "err"}`} style={{ marginBottom: 20 }}>
          <i className={`bi ${msg.type === "ok" ? "bi-check-circle" : "bi-exclamation-triangle"} me-1`}></i>
          {msg.text}
        </div>
      )}

      {/* Create / Edit Form Card */}
      {formOpen && (
        <div className="admin-ad-form-card">
          <div className="admin-ad-form-head">
            <h3>
              <i className={`bi ${editingId ? "bi-pencil-square" : "bi-plus-circle"} me-2 text-primary`}></i>
              {editingId ? "Edit Advertisement" : "Create New Advertisement / Popup"}
            </h3>
            <span className="badge-chip">
              {editingId ? "Updating Existing Ad" : "New Campaign"}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Choose Ad Type: Standard Card vs Custom Poster */}
            <div className="admin-ad-format-selector">
              <label className="admin-label mb-2" style={{ fontWeight: 700, fontSize: 13.5 }}>
                <i className="bi bi-palette-fill me-1 text-primary"></i> Choose Ad Format / Style (விளம்பர வடிவம்) *
              </label>
              <div className="admin-format-toggle-grid">
                <div
                  className={`admin-format-option-card ${!form.isPoster ? "selected" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, isPoster: false }))}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-format-icon">
                    <i className="bi bi-layout-text-window-reverse"></i>
                  </div>
                  <div className="admin-format-details">
                    <strong>Standard Card Ad (கார்டு வடிவம்)</strong>
                    <p>Structured card with headline, badge, subtitle, trust tags & action buttons.</p>
                  </div>
                  <div className="admin-format-radio">
                    <input
                      type="radio"
                      name="adFormat"
                      checked={!form.isPoster}
                      onChange={() => setForm((p) => ({ ...p, isPoster: false }))}
                    />
                  </div>
                </div>

                <div
                  className={`admin-format-option-card ${form.isPoster ? "selected" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, isPoster: true }))}
                  role="button"
                  tabIndex={0}
                >
                  <div className="admin-format-icon gold">
                    <i className="bi bi-file-earmark-image-fill"></i>
                  </div>
                  <div className="admin-format-details">
                    <strong>Custom Poster Ad (சுய போஸ்டர் விளம்பரம்)</strong>
                    <p>Directly upload your own designed marketing poster / flyer graphic (Full Poster Popup).</p>
                  </div>
                  <div className="admin-format-radio">
                    <input
                      type="radio"
                      name="adFormat"
                      checked={form.isPoster}
                      onChange={() => setForm((p) => ({ ...p, isPoster: true }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-ad-form-grid">
              {/* Left Column: Form Fields */}
              <div className="admin-ad-fields-col">
                {/* Poster Specific Upload Dropzone if isPoster */}
                {form.isPoster && (
                  <div className="admin-poster-upload-section">
                    <label className="admin-label" style={{ fontWeight: 700 }}>
                      <i className="bi bi-cloud-arrow-up-fill me-1 text-warning"></i> Upload Designed Poster Flyer (PNG / JPG / WebP) *
                    </label>
                    <div className="admin-poster-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        id="poster-file-input"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                      <label htmlFor="poster-file-input" className="admin-poster-drop-btn">
                        <i className="bi bi-file-earmark-arrow-up-fill fs-2 mb-2 text-primary"></i>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Click to Browse & Select Poster Image</span>
                        <small style={{ color: "var(--muted)", fontSize: 12 }}>Upload your prepared flyer/creative (Up to 10 MB)</small>
                      </label>
                      <div className="admin-poster-url-fallback">
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>Or paste direct poster image URL:</span>
                        <input
                          type="text"
                          className="admin-input"
                          value={form.imageUrl}
                          onChange={(e) => {
                            setF("imageUrl")(e);
                            if (!file) setPreviewUrl(e.target.value);
                          }}
                          placeholder="e.g. /posters/ai-career-poster.jpg or https://..."
                        />
                      </div>
                    </div>

                    <div className="admin-grid-2 mt-3">
                      <div className="admin-field-group">
                        <label className="admin-label">Poster Scaling / Fit</label>
                        <select
                          className="admin-select"
                          value={form.posterFit}
                          onChange={setF("posterFit")}
                        >
                          <option value="contain">Contain (முழு போஸ்டரும் வெட்டப்படாமல் தெரியும்படி - Recommended)</option>
                          <option value="cover">Cover (முழு கார்டையும் நிரப்பும் வடிவம்)</option>
                        </select>
                      </div>
                      <div className="admin-field-group">
                        <label className="admin-label">Display Delay (seconds)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          className="admin-input"
                          value={form.delaySeconds}
                          onChange={setF("delaySeconds")}
                          placeholder="e.g. 2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Title / Campaign Name */}
                <div className="admin-field-group">
                  <label className="admin-label">
                    {form.isPoster ? "Poster Campaign Name / Internal Title *" : "Headline / Title *"}
                  </label>
                  <input
                    type="text"
                    required
                    className="admin-input"
                    value={form.title}
                    onChange={setF("title")}
                    placeholder={form.isPoster ? "e.g. AI Career Coaching Poster 2026" : "e.g. Launch Your AI Career in Coimbatore"}
                  />
                  {form.isPoster && (
                    <small style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                      Used as the campaign name in Admin table and accessibility label.
                    </small>
                  )}
                </div>

                {/* Eyebrow Badge & Subtitle (only for standard card ad) */}
                {!form.isPoster && (
                  <>
                    <div className="admin-grid-2">
                      <div className="admin-field-group">
                        <label className="admin-label">Badge / Eyebrow Text</label>
                        <input
                          type="text"
                          className="admin-input"
                          value={form.badge}
                          onChange={setF("badge")}
                          placeholder="e.g. 🚀 FAST-TRACK BATCH"
                        />
                      </div>
                      <div className="admin-field-group">
                        <label className="admin-label">Display Delay (seconds)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          className="admin-input"
                          value={form.delaySeconds}
                          onChange={setF("delaySeconds")}
                          placeholder="e.g. 2"
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-label">Description / Subtitle</label>
                      <textarea
                        rows={3}
                        className="admin-input"
                        value={form.subtitle}
                        onChange={setF("subtitle")}
                        placeholder="Describe the offer, eligibility, ISO certification, or value proposition..."
                      />
                    </div>
                  </>
                )}

                {/* Placement & Target Page (ENGA ENGA PODALAM) */}
                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">
                      <i className="bi bi-layout-sidebar-inset-reverse me-1 text-primary"></i> Placement Style (Format) *
                    </label>
                    <select
                      className="admin-select"
                      value={form.placement}
                      onChange={setF("placement")}
                    >
                      <option value="popup">Center Modal Popup (Opening Popup - Best for Posters)</option>
                      <option value="floating">Floating Side Card (Bottom-Right, non-intrusive)</option>
                      {!form.isPoster && <option value="topbar">Top Announcement Bar (Sticky Banner)</option>}
                    </select>
                    <small style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                      {form.placement === "popup" && "Opens as a focused center modal on screen with close button."}
                      {form.placement === "floating" && "Appears non-intrusively at the bottom corner with minimize toggle."}
                      {form.placement === "topbar" && "Displays as a sleek header strip across the page."}
                    </small>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">
                      <i className="bi bi-geo-alt-fill me-1 text-primary"></i> Target Page (Where to Display) *
                    </label>
                    <select
                      className="admin-select"
                      value={form.targetPage}
                      onChange={setF("targetPage")}
                    >
                      <option value="/">🏠 Home Page Only (/)</option>
                      <option value="/internship">🎓 Internship Page Only (/internship)</option>
                      <option value="/services">💼 Services Page Only (/services)</option>
                      <option value="/careers">🚀 Careers Page Only (/careers)</option>
                      <option value="/about">🏢 About Us Page Only (/about)</option>
                      <option value="/contact">📞 Contact Page Only (/contact)</option>
                      <option value="/bpo">🎧 BPO Services (/bpo)</option>
                      <option value="/tourism">✈️ Tourism Page (/tourism)</option>
                      <option value="/gallery">🖼️ Gallery Page (/gallery)</option>
                      <option value="all">🌐 Everywhere (All Pages)</option>
                    </select>
                  </div>
                </div>

                {/* Standard image input if NOT poster */}
                {!form.isPoster && (
                  <div className="admin-field-group">
                    <label className="admin-label">Ad Banner Image (Optional)</label>
                    <div className="admin-grid-2">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="admin-input"
                          onChange={handleFileChange}
                        />
                        <small style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                          Upload PNG, JPG or WebP (max 5 MB)
                        </small>
                      </div>
                      <div>
                        <input
                          type="text"
                          className="admin-input"
                          value={form.imageUrl}
                          onChange={(e) => {
                            setF("imageUrl")(e);
                            if (!file) setPreviewUrl(e.target.value);
                          }}
                          placeholder="Or paste image URL (/hero/slide-1.jpg)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Call to Action Buttons */}
                <div className="admin-grid-2">
                  <div className="admin-field-group">
                    <label className="admin-label">
                      {form.isPoster ? "Poster Click Destination (Link URL) *" : "CTA Button Link *"}
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.ctaLink}
                      onChange={setF("ctaLink")}
                      placeholder="e.g. /internship, /contact, or WhatsApp link"
                    />
                    <small style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, display: "block" }}>
                      Where visitors go when tapping the poster / button.
                    </small>
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", alignSelf: "center", marginRight: 2 }}>
                        Quick Presets:
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px", background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", color: "var(--primary)" }}
                        onClick={() => {
                          setForm((f) => ({ ...f, ctaLink: "/careers/non-it?role=HR#apply", ctaText: "Apply for HR" }));
                        }}
                      >
                        💼 HR Job Apply
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px", background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", color: "var(--primary)" }}
                        onClick={() => {
                          setForm((f) => ({ ...f, ctaLink: "/careers/it?role=Frontend%20Developer#apply", ctaText: "Apply Now" }));
                        }}
                      >
                        💻 Frontend Dev
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px", background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", color: "var(--primary)" }}
                        onClick={() => {
                          setForm((f) => ({ ...f, ctaLink: "/careers/non-it?role=Data%20Entry#apply", ctaText: "Apply Now" }));
                        }}
                      >
                        ⌨️ Data Entry
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px", background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", color: "var(--primary)" }}
                        onClick={() => {
                          setForm((f) => ({ ...f, ctaLink: "/internship#apply", ctaText: "Apply for Internship" }));
                        }}
                      >
                        🎓 Internship
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: "3px 8px", background: "rgba(13,110,253,0.1)", border: "1px solid rgba(13,110,253,0.3)", color: "var(--primary)" }}
                        onClick={() => {
                          setForm((f) => ({ ...f, ctaLink: "/contact", ctaText: "Get Free Quote" }));
                        }}
                      >
                        📞 Contact / Quote
                      </button>
                    </div>
                  </div>

                  <div className="admin-field-group">
                    <label className="admin-label">
                      {form.isPoster ? "Optional Button on Poster (Overlay)" : "CTA Button Label"}
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.ctaText}
                      onChange={setF("ctaText")}
                      placeholder={form.isPoster ? "e.g. Apply Now (or leave blank for pure image click)" : "e.g. Apply Now"}
                    />
                  </div>
                </div>

                {/* Secondary Button & Active Toggle */}
                <div className="admin-grid-2" style={{ alignItems: "center" }}>
                  {!form.isPoster && (
                    <div className="admin-field-group">
                      <label className="admin-label">Dismiss / Secondary Button</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.secondaryText}
                        onChange={setF("secondaryText")}
                        placeholder="e.g. Close or Maybe Later"
                      />
                    </div>
                  )}

                  <div className="admin-field-group" style={{ paddingTop: form.isPoster ? 0 : 18 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={setF("active")}
                        style={{ width: 18, height: 18, accentColor: "var(--color-primary, #0284c7)" }}
                      />
                      <span>Active (Enable immediately on website)</span>
                    </label>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <i className="bi bi-hourglass-split me-1"></i> Saving…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        {editingId ? "Update Advertisement" : "Save & Publish Advertisement"}
                      </>
                    )}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Column: Live Interactive Preview */}
              <div className="admin-ad-preview-col">
                <div className="admin-ad-preview-header">
                  <i className="bi bi-eye-fill me-1 text-primary"></i> Live Design Preview
                  <span className="badge-chip ms-auto">
                    {form.isPoster ? "Custom Poster" : form.placement === "popup" ? "Center Modal" : form.placement === "floating" ? "Floating Card" : "Top Banner"}
                  </span>
                </div>

                <div className="admin-ad-preview-sandbox">
                  {/* Poster style preview */}
                  {form.isPoster ? (
                    <div className="live-preview-poster-mock">
                      <div className="live-poster-close-btn">×</div>
                      {previewUrl ? (
                        <div className="live-poster-img-container">
                          <img
                            src={previewUrl}
                            alt="Poster preview"
                            className="live-poster-preview-img"
                            style={{ objectFit: form.posterFit || "contain" }}
                          />
                          {form.ctaText && (
                            <div className="live-poster-btn-bar">
                              <button type="button" className="btn live-poster-action-btn">
                                {form.ctaText} <i className="bi bi-arrow-right ms-1"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="live-poster-empty-prompt">
                          <i className="bi bi-file-earmark-image fs-1 mb-2 text-warning"></i>
                          <strong>No Poster Uploaded Yet</strong>
                          <p>Select or upload your designed poster image to see the live popup preview.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Modal style preview */}
                      {form.placement === "popup" && (
                        <div className="live-preview-modal-mock">
                          <div className="live-modal-close-btn">×</div>
                          {previewUrl ? (
                            <div className="live-modal-img-wrap">
                              <img src={previewUrl} alt="Ad preview" />
                            </div>
                          ) : (
                            <div className="live-modal-img-placeholder">
                              <i className="bi bi-stars"></i>
                            </div>
                          )}
                          <div className="live-modal-content">
                            {form.badge && <span className="live-modal-badge">{form.badge}</span>}
                            <h4 className="live-modal-title">{form.title || "Your Advertisement Title Here"}</h4>
                            <p className="live-modal-sub">{form.subtitle || "Your advertisement description and value proposition will appear right here."}</p>
                            <div className="live-modal-trust-tags">
                              <span><i className="bi bi-shield-check me-1"></i> ISO 9001:2015</span>
                              <span><i className="bi bi-patch-check me-1"></i> Verified</span>
                            </div>
                            <div className="live-modal-actions">
                              <button type="button" className="btn btn-primary btn-sm">
                                {form.ctaText || "Apply Now"} <i className="bi bi-arrow-right"></i>
                              </button>
                              <button type="button" className="btn btn-outline btn-sm">
                                {form.secondaryText || "Close"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Floating card preview */}
                      {form.placement === "floating" && (
                        <div className="live-preview-floating-mock">
                          <div className="live-floating-close-btn">×</div>
                          <div className="live-floating-header">
                            {form.badge && <span className="live-modal-badge">{form.badge}</span>}
                          </div>
                          <div className="live-floating-body">
                            {previewUrl && (
                              <img src={previewUrl} alt="Thumbnail" className="live-floating-thumb" />
                            )}
                            <div>
                              <h5 className="live-floating-title">{form.title || "Floating Promo Title"}</h5>
                              <p className="live-floating-sub">{form.subtitle || "Brief promo text visible in the bottom corner of the screen."}</p>
                            </div>
                          </div>
                          <div className="live-floating-footer">
                            <button type="button" className="btn btn-primary btn-sm">
                              {form.ctaText || "Claim Offer"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Topbar preview */}
                      {form.placement === "topbar" && (
                        <div className="live-preview-topbar-mock">
                          {form.badge && <span className="live-topbar-tag">{form.badge}</span>}
                          <span className="live-topbar-text">
                            <strong>{form.title || "Announcement Title"}</strong> — {form.subtitle || "Limited time offer."}
                          </span>
                          <button type="button" className="btn btn-primary btn-sm" style={{ padding: "3px 12px", fontSize: 12 }}>
                            {form.ctaText || "Check Details"}
                          </button>
                          <span className="live-topbar-close">×</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="live-preview-hint">
                  <i className="bi bi-info-circle me-1"></i> This simulates how the ad will render to visitors on target pages.
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Ads Filter Toolbar */}
      <div className="admin-ad-toolbar">
        <div className="admin-ad-toolbar-left">
          {/* Target Page Filter */}
          <div className="admin-pill-group">
            <button
              type="button"
              className={`admin-filter-pill ${filterPage === "all" ? "active" : ""}`}
              onClick={() => setFilterPage("all")}
            >
              All Pages
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPage === "/" ? "active" : ""}`}
              onClick={() => setFilterPage("/")}
            >
              <i className="bi bi-house me-1"></i> Home (/)
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPage === "/internship" ? "active" : ""}`}
              onClick={() => setFilterPage("/internship")}
            >
              <i className="bi bi-mortarboard me-1"></i> Internship
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPage === "/services" ? "active" : ""}`}
              onClick={() => setFilterPage("/services")}
            >
              <i className="bi bi-gear me-1"></i> Services
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPage === "/careers" ? "active" : ""}`}
              onClick={() => setFilterPage("/careers")}
            >
              <i className="bi bi-briefcase me-1"></i> Careers
            </button>
          </div>

          {/* Placement Filters */}
          <div className="admin-pill-group">
            <button
              type="button"
              className={`admin-filter-pill ${filterPlacement === "all" ? "active" : ""}`}
              onClick={() => setFilterPlacement("all")}
            >
              All Formats
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPlacement === "popup" ? "active" : ""}`}
              onClick={() => setFilterPlacement("popup")}
            >
              <i className="bi bi-window-stack me-1"></i> Popups ({stats.popup})
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPlacement === "floating" ? "active" : ""}`}
              onClick={() => setFilterPlacement("floating")}
            >
              <i className="bi bi-card-heading me-1"></i> Floating ({stats.floating})
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterPlacement === "topbar" ? "active" : ""}`}
              onClick={() => setFilterPlacement("topbar")}
            >
              <i className="bi bi-view-stacked me-1"></i> Top Bars ({stats.topbar})
            </button>
          </div>

          {/* Status Filter */}
          <div className="admin-pill-group">
            <button
              type="button"
              className={`admin-filter-pill ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All Status
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterStatus === "active" ? "active" : ""}`}
              onClick={() => setFilterStatus("active")}
            >
              <span className="dot green"></span> Live
            </button>
            <button
              type="button"
              className={`admin-filter-pill ${filterStatus === "paused" ? "active" : ""}`}
              onClick={() => setFilterStatus("paused")}
            >
              <span className="dot gray"></span> Paused
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="admin-ad-search">
          <i className="bi bi-search"></i>
          <input
            type="text"
            className="admin-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search advertisements..."
          />
        </div>
      </div>

      {/* Ads List Cards */}
      {filteredAds.length === 0 ? (
        <div className="admin-empty" style={{ margin: "30px 0" }}>
          <i className="bi bi-megaphone"></i>
          <p style={{ margin: "8px 0 0" }}>No advertisements found matching current filters.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={() => {
              setFilterPlacement("all");
              setFilterStatus("all");
              setSearch("");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="admin-ad-cards-grid">
          {filteredAds.map((ad) => {
            const isToggling = togglingId === ad.id;
            const isDeleting = deletingId === ad.id;
            const isActive = ad.active !== false;

            return (
              <div key={ad.id} className={`admin-ad-card ${isActive ? "active-ad" : "paused-ad"}`}>
                {/* Card Top Row */}
                <div className="admin-ad-card-head">
                  <div className="admin-ad-status-indicator">
                    <span className={`ad-status-dot ${isActive ? "live" : "paused"}`}></span>
                    <strong>{isActive ? "Live / Active" : "Paused / Inactive"}</strong>
                  </div>
                  <div className="admin-ad-format-tag" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {ad.isPoster && (
                      <span className="badge-chip" style={{ background: "rgba(234, 179, 8, 0.18)", color: "#b45309", fontWeight: 800 }}>
                        <i className="bi bi-file-earmark-image-fill me-1"></i> Poster Ad
                      </span>
                    )}
                    {ad.targetPage === "/" && (
                      <span className="badge-chip blue">
                        <i className="bi bi-house me-1"></i> Home (/)
                      </span>
                    )}
                    {ad.targetPage === "/internship" && (
                      <span className="badge-chip" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                        <i className="bi bi-mortarboard me-1"></i> Internship
                      </span>
                    )}
                    {ad.targetPage === "/services" && (
                      <span className="badge-chip purple">
                        <i className="bi bi-gear me-1"></i> Services
                      </span>
                    )}
                    {ad.targetPage === "/careers" && (
                      <span className="badge-chip orange">
                        <i className="bi bi-briefcase me-1"></i> Careers
                      </span>
                    )}
                    {ad.targetPage === "all" && (
                      <span className="badge-chip">
                        <i className="bi bi-globe me-1"></i> All Pages
                      </span>
                    )}

                    {ad.placement === "popup" && (
                      <span className="badge-chip blue">
                        <i className="bi bi-window-stack me-1"></i> Popup
                      </span>
                    )}
                    {ad.placement === "floating" && (
                      <span className="badge-chip orange">
                        <i className="bi bi-card-heading me-1"></i> Floating
                      </span>
                    )}
                    {ad.placement === "topbar" && (
                      <span className="badge-chip purple">
                        <i className="bi bi-view-stacked me-1"></i> Top Bar
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail + Title */}
                <div className="admin-ad-card-main">
                  {ad.imageUrl ? (
                    <div className="admin-ad-card-img-wrap">
                      <img src={ad.imageUrl} alt={ad.title} className="admin-ad-card-img" />
                    </div>
                  ) : (
                    <div className="admin-ad-card-img-wrap placeholder">
                      <i className="bi bi-megaphone"></i>
                    </div>
                  )}

                  <div className="admin-ad-card-info">
                    {ad.badge && <span className="admin-ad-eyebrow">{ad.badge}</span>}
                    <h4 className="admin-ad-card-title">{ad.title}</h4>
                    {ad.subtitle && <p className="admin-ad-card-sub">{ad.subtitle}</p>}
                  </div>
                </div>

                {/* Target & Timing Metadata */}
                <div className="admin-ad-card-meta">
                  <span className="ad-meta-chip">
                    <i className="bi bi-pin-map me-1"></i> Page: <strong>{ad.targetPage === "all" ? "All Pages" : ad.targetPage}</strong>
                  </span>
                  <span className="ad-meta-chip">
                    <i className="bi bi-stopwatch me-1"></i> Delay: <strong>{ad.delaySeconds ?? 2}s</strong>
                  </span>
                  <span className="ad-meta-chip">
                    <i className="bi bi-cursor-fill me-1"></i> Action: <strong>{ad.ctaText || "Apply"}</strong> ({ad.ctaLink || "/"})
                  </span>
                </div>

                {/* Card Actions (MATHA / ALICHURU / TOGGLE / PREVIEW) */}
                <div className="admin-ad-card-footer">
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Live Screen Preview Modal */}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      title="Test preview on screen"
                      onClick={() => setTestPreviewAd(ad)}
                    >
                      <i className="bi bi-eye me-1"></i> Preview
                    </button>

                    {/* Toggle Active / Paused */}
                    <button
                      type="button"
                      className={`btn btn-sm ${isActive ? "btn-outline" : "btn-primary"}`}
                      disabled={isToggling}
                      onClick={() => handleToggle(ad.id)}
                      title={isActive ? "Pause this advertisement" : "Activate this advertisement"}
                    >
                      <i className={`bi ${isActive ? "bi-pause-fill" : "bi-play-fill"} me-1`}></i>
                      {isActive ? "Pause" : "Activate"}
                    </button>

                    {/* Edit Ad (MATHA) */}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => handleStartEdit(ad)}
                      title="Edit advertisement details"
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Edit
                    </button>
                  </div>

                  {/* Delete Ad (POTTADA ALICHURU) */}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm text-danger"
                    disabled={isDeleting}
                    onClick={() => handleDelete(ad.id, ad.title)}
                    title="Permanently delete this advertisement"
                  >
                    <i className="bi bi-trash-fill me-1"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Screen Test Preview Overlay */}
      {testPreviewAd && (
        <div className="admin-modal-overlay" onClick={() => setTestPreviewAd(null)}>
          <div className="admin-ad-test-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ad-test-modal-header">
              <h4>
                <i className="bi bi-display me-1 text-primary"></i> Live Screen Preview of "{testPreviewAd.title}"
              </h4>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setTestPreviewAd(null)}
              >
                Close Preview (ESC)
              </button>
            </div>

            <div className="ad-test-modal-body">
              {testPreviewAd.placement === "popup" && (
                testPreviewAd.isPoster ? (
                  <div className="site-ad-poster-card" style={{ margin: "20px auto", position: "relative" }}>
                    <button
                      type="button"
                      className="site-ad-poster-close"
                      onClick={() => setTestPreviewAd(null)}
                      title="Close"
                    >
                      ×
                    </button>
                    <div className="site-ad-poster-click-wrap">
                      <img
                        src={testPreviewAd.imageUrl || "/tct-logo.png"}
                        alt={testPreviewAd.title}
                        className="site-ad-poster-img"
                        style={{ objectFit: testPreviewAd.posterFit || "contain" }}
                      />
                      {testPreviewAd.ctaText && (
                        <div className="site-ad-poster-action-bar">
                          <button type="button" className="btn site-ad-poster-action-btn">
                            {testPreviewAd.ctaText} <i className="bi bi-arrow-right ms-2"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="ad-popup-modal-card">
                    <button
                      type="button"
                      className="ad-popup-close-btn"
                      onClick={() => setTestPreviewAd(null)}
                    >
                      ×
                    </button>
                    {testPreviewAd.imageUrl ? (
                      <div className="ad-popup-image-pane">
                        <img src={testPreviewAd.imageUrl} alt={testPreviewAd.title} />
                      </div>
                    ) : (
                      <div className="ad-popup-image-pane fallback">
                        <i className="bi bi-stars"></i>
                        <span>TREND CODE TECHNOLOGY</span>
                      </div>
                    )}
                    <div className="ad-popup-body-pane">
                      {testPreviewAd.badge && (
                        <span className="ad-popup-badge-chip">{testPreviewAd.badge}</span>
                      )}
                      <h3 className="ad-popup-title">{testPreviewAd.title}</h3>
                      {testPreviewAd.subtitle && (
                        <p className="ad-popup-desc">{testPreviewAd.subtitle}</p>
                      )}
                      <div className="ad-popup-trust-row">
                        <span className="ad-trust-tag"><i className="bi bi-patch-check-fill me-1 text-primary"></i> ISO 9001:2015</span>
                        <span className="ad-trust-tag"><i className="bi bi-shield-fill-check me-1 text-success"></i> Govt. Recognized</span>
                      </div>
                      <div className="ad-popup-actions-row">
                        <a href={testPreviewAd.ctaLink || "#"} className="btn btn-primary" onClick={(e) => e.preventDefault()}>
                          {testPreviewAd.ctaText || "Apply Now"} <i className="bi bi-arrow-right"></i>
                        </a>
                        {testPreviewAd.secondaryText && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setTestPreviewAd(null)}
                          >
                            {testPreviewAd.secondaryText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {testPreviewAd.placement === "floating" && (
                <div className="ad-floating-side-card" style={{ position: "relative", bottom: "auto", right: "auto", margin: "20px auto" }}>
                  <button
                    type="button"
                    className="ad-floating-close-btn"
                    onClick={() => setTestPreviewAd(null)}
                  >
                    ×
                  </button>
                  <div className="ad-floating-top">
                    {testPreviewAd.badge && <span className="ad-popup-badge-chip">{testPreviewAd.badge}</span>}
                  </div>
                  <div className="ad-floating-main">
                    {testPreviewAd.imageUrl && (
                      <img src={testPreviewAd.imageUrl} alt="Thumbnail" className="ad-floating-img" />
                    )}
                    <div>
                      <h4 className="ad-floating-title">{testPreviewAd.title}</h4>
                      <p className="ad-floating-sub">{testPreviewAd.subtitle}</p>
                    </div>
                  </div>
                  <div className="ad-floating-foot">
                    <a href={testPreviewAd.ctaLink || "#"} className="btn btn-primary btn-sm" onClick={(e) => e.preventDefault()}>
                      {testPreviewAd.ctaText || "Check Offer"}
                    </a>
                  </div>
                </div>
              )}

              {testPreviewAd.placement === "topbar" && (
                <div className="ad-topbar-strip" style={{ position: "relative", margin: "20px auto" }}>
                  {testPreviewAd.badge && <span className="ad-topbar-badge">{testPreviewAd.badge}</span>}
                  <span className="ad-topbar-msg">
                    <strong>{testPreviewAd.title}</strong> — {testPreviewAd.subtitle}
                  </span>
                  <a href={testPreviewAd.ctaLink || "#"} className="btn btn-primary btn-sm" onClick={(e) => e.preventDefault()}>
                    {testPreviewAd.ctaText || "Learn More"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
