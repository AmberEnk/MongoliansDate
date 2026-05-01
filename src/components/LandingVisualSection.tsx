import { useTranslation } from "react-i18next";

/** Unsplash CDN — free to use under Unsplash License; illustrative stock only. */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=960&q=82&auto=format&fit=crop`;

type GalleryItem =
  | { kind: "local"; src: string; width: number; height: number }
  | { kind: "unsplash"; id: string };

const GALLERY: GalleryItem[] = [
  { kind: "local", src: "/landing-gobi-altai-steppe.png", width: 1024, height: 688 },
  { kind: "unsplash", id: "photo-1647070996344-46339c43751e" },
  { kind: "unsplash", id: "photo-1571867424488-4565932edb41" },
  { kind: "unsplash", id: "photo-1588848476449-b8295a894596" },
  { kind: "unsplash", id: "photo-1516589178581-6cd7833ae3b2" },
  { kind: "unsplash", id: "photo-1519741497674-611481863552" },
  { kind: "unsplash", id: "photo-1502602898657-3e91760cbb34" },
  { kind: "unsplash", id: "photo-1653356549582-311057045381" },
  { kind: "unsplash", id: "photo-1680230955697-98238b8fd9cf" },
];

export default function LandingVisualSection() {
  const { t } = useTranslation();

  return (
    <section id="visuals" className="landing-section landing-section--gallery-only">
      <ul className="landing-visual-grid landing-visual-grid--radiant">
        {GALLERY.map((item, i) => {
          const src = item.kind === "local" ? item.src : UNSPLASH(item.id);
          const w = item.kind === "local" ? item.width : 960;
          const h = item.kind === "local" ? item.height : 640;
          const key = item.kind === "local" ? item.src : item.id;
          return (
            <li key={key} className="landing-visual-card">
              <figure className="landing-visual-card__figure">
                <img
                  src={src}
                  alt={t(`landing.visualAlt${i + 1}`)}
                  loading="lazy"
                  decoding="async"
                  width={w}
                  height={h}
                  className="landing-visual-card__img"
                />
              </figure>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
