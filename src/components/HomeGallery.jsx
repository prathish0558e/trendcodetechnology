import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Reveal, SectionHead } from "./Reveal.jsx";
import { getGallery } from "../api.js";

const DEFAULT_HOME_PHOTOS = [
  {
    id: "hg-1",
    title: "TCT Engineering Lab & Development Center",
    category: "Office",
    imageUrl: "/slide-2.jpg",
    date: "2026-02-15",
    description: "Our state-of-the-art software engineering floor in Ganapathy, Coimbatore.",
  },
  {
    id: "hg-2",
    title: "Client Collaboration & Tech Meetup",
    category: "Events",
    imageUrl: "/slide-1.jpg",
    date: "2026-02-20",
    description: "Brainstorming modern cloud architectures and product roadmaps with enterprise partners.",
  },
  {
    id: "hg-3",
    title: "Code Sprint & Hackathon",
    category: "Workspace",
    imageUrl: "/hero-poster.jpg",
    date: "2026-03-01",
    description: "Full-stack developer sprint solving real-world challenges with AI and modern web frameworks.",
  },
  {
    id: "hg-4",
    title: "TCT Leadership & Management Team",
    category: "Team",
    imageUrl: "/team/bharath.jpg",
    date: "2026-03-05",
    description: "Under the visionary leadership of Mr. Bharath T, Founder & CEO.",
  },
  {
    id: "hg-5",
    title: "Team Outing & Annual Retreat",
    category: "Celebrations",
    imageUrl: "/tourism/ooty.jpg",
    date: "2026-03-10",
    description: "Recharging minds amidst the Nilgiri hills during our annual team celebration.",
  },
  {
    id: "hg-6",
    title: "TCT Brand & Excellence Milestone",
    category: "Achievements",
    imageUrl: "/tct-shirt-logo.png",
    date: "2026-03-12",
    description: "Celebrating 1,150+ completed client deliveries and rapid expansion across sectors.",
  },
];

export default function HomeGallery() {
  const [photos, setPhotos] = useState(DEFAULT_HOME_PHOTOS);
  const [activePhoto, setActivePhoto] = useState(null);
  const [activeIdx, setActiveIdx] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    getGallery()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setPhotos(data);
        }
      })
      .catch(() => {
        // Fallback to default starter photos
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Subtle scroll-driven translation so scrolling the page gently shifts the stream
  useEffect(() => {
    const onScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Calculate scroll progress through the section
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        scrollOffsetRef.current = progress * 60; // gentle shift up to 60px
        trackRef.current.style.setProperty("--scroll-shift", `${scrollOffsetRef.current}px`);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e) => {
      if (activeIdx === null) return;
      if (e.key === "Escape") {
        setActiveIdx(null);
        setActivePhoto(null);
      }
      if (e.key === "ArrowLeft") {
        const next = activeIdx > 0 ? activeIdx - 1 : photos.length - 1;
        setActiveIdx(next);
        setActivePhoto(photos[next]);
      }
      if (e.key === "ArrowRight") {
        const next = activeIdx < photos.length - 1 ? activeIdx + 1 : 0;
        setActiveIdx(next);
        setActivePhoto(photos[next]);
      }
    },
    [activeIdx, photos]
  );

  useEffect(() => {
    if (activePhoto) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePhoto, handleKeyDown]);

  const openLightbox = (photo, idx) => {
    setActivePhoto(photo);
    setActiveIdx(idx);
  };

  // Duplicate items for infinite seamless scroll ribbon
  const ribbonItems = [...photos, ...photos];

  return (
    <section className="section home-gallery-section">
      <div className="container">
        <SectionHead
          eyebrow="Life at TCT"
          title="Moments, Culture & Innovation"
          text="A glimpse into our engineering floors, client tech summits, hackathons, and celebrations in Coimbatore."
        />
      </div>

      {/* Infinite Smooth Scroll Ribbon with scroll reaction */}
      <div
        className="home-gallery-wrap"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className="home-gallery-track"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
            transform: `translateX(calc(-10px - var(--scroll-shift, 0px)))`,
          }}
        >
          {ribbonItems.map((item, idx) => {
            const originalIndex = idx % photos.length;
            return (
              <div
                key={`${item.id || "p"}-${idx}`}
                className="home-gallery-card"
                onClick={() => openLightbox(item, originalIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(item, originalIndex);
                  }
                }}
                aria-label={`View photo: ${item.title}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title || "TCT Gallery Photo"}
                  loading="lazy"
                />
                <div className="home-gallery-card-overlay">
                  <div className="home-gallery-card-top">
                    <span className="home-gallery-card-badge">
                      {item.category || "TCT"}
                    </span>
                    <span className="home-gallery-zoom-ic">
                      <i className="bi bi-arrows-fullscreen"></i>
                    </span>
                  </div>
                  <div className="home-gallery-card-bot">
                    <h4>{item.title}</h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="container">
        <Reveal>
          <div className="home-gallery-actions">
            <Link to="/gallery" className="btn btn-primary btn-lg">
              Explore Gallery <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Lightbox Modal on Home Page */}
      {activePhoto && (
        <div
          className="gallery-lightbox"
          onClick={() => {
            setActivePhoto(null);
            setActiveIdx(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="gallery-lightbox-close"
            onClick={() => {
              setActivePhoto(null);
              setActiveIdx(null);
            }}
            aria-label="Close photo preview"
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <button
            className="gallery-lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              const next = activeIdx > 0 ? activeIdx - 1 : photos.length - 1;
              setActiveIdx(next);
              setActivePhoto(photos[next]);
            }}
            aria-label="Previous photo"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <button
            className="gallery-lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              const next = activeIdx < photos.length - 1 ? activeIdx + 1 : 0;
              setActiveIdx(next);
              setActivePhoto(photos[next]);
            }}
            aria-label="Next photo"
          >
            <i className="bi bi-chevron-right"></i>
          </button>

          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-lightbox-img-wrap">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="gallery-lightbox-img"
              />
            </div>
            <div className="gallery-lightbox-caption">
              <div className="gallery-lightbox-header">
                <span className="gallery-badge">{activePhoto.category || "TCT"}</span>
                {activePhoto.date && (
                  <span className="gallery-date" style={{ color: "#94a3b8" }}>
                    <i className="bi bi-calendar3"></i> {activePhoto.date}
                  </span>
                )}
                <span className="gallery-counter">
                  {activeIdx + 1} / {photos.length}
                </span>
              </div>
              <h2 className="gallery-lightbox-title">{activePhoto.title}</h2>
              {activePhoto.description && (
                <p className="gallery-lightbox-desc">{activePhoto.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
