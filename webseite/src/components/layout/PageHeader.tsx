type Props = {
  /**
   * Seiten-Titel. Optional — wenn leer/weggelassen, wird der Wood-Texture-
   * Streifen ohne Text gerendert (z.B. fuer Landing-Pages mit eigenem Hero-H1).
   */
  title?: string;
  /**
   * Wenn true, wird der Titel als <div> gerendert statt <h1>.
   * Notwendig auf Seiten, die bereits eine eigene H1 im Content haben
   * (z.B. /audio-gaestebuch), um doppelte H1s zu vermeiden.
   */
  decorative?: boolean;
};

export default function PageHeader({ title, decorative = false }: Props) {
  const Tag = decorative ? "div" : "h1";
  return (
    <div
      className="relative w-full h-[280px] md:h-[320px] bg-cover bg-center flex items-end rough-bottom"
      style={{ backgroundImage: "url('/images/misc/fancy-header.jpg')" }}
    >
      {title ? (
        <div className="max-w-[1200px] mx-auto px-4 w-full pb-12">
          <Tag
            className="text-[36px] md:text-[48px] text-white font-extrabold uppercase tracking-[0.02em] font-[family-name:var(--font-fira-condensed)]"
          >
            {title}
          </Tag>
        </div>
      ) : null}
    </div>
  );
}
