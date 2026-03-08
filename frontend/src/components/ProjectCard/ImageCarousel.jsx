import { useState, useEffect, useRef } from "react";
import "./ImageCarousel.css";

export function ImageCarousel({ images, alt, loaded, onImageLoad }) {
  const allImages = (images && images.length > 0) ? images : [];
  const single = allImages.length <= 1;

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  function prev(e) {
    e.stopPropagation();
    setIndex((i) => (i - 1 + allImages.length) % allImages.length);
  }

  function next(e) {
    e.stopPropagation();
    setIndex((i) => (i + 1) % allImages.length);
  }

  function goTo(e, i) {
    e.stopPropagation();
    setIndex(i);
  }

  useEffect(() => {
    if (single || hovered) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % allImages.length);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [single, hovered, allImages.length]);

  return (
    <div
      className="carousel-root"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {allImages.map((src, i) => (
        <img
          key={src}
          className={`carousel-img ${loaded ? "is-visible" : ""} ${i === index ? "is-active" : ""}`}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={i === 0 ? onImageLoad : undefined}
          aria-hidden={i !== index}
        />
      ))}

      {!single && (
        <>
          <button className="carousel-arrow carousel-arrow-left" onClick={prev} aria-label="Previous image">‹</button>
          <button className="carousel-arrow carousel-arrow-right" onClick={next} aria-label="Next image">›</button>
          <div className="carousel-dots">
            {allImages.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === index ? "is-active" : ""}`}
                onClick={(e) => goTo(e, i)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
