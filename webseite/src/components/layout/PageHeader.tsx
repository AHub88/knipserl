export default function PageHeader({ title }: { title: string }) {
  return (
    <div
      className="relative w-full h-[180px] bg-cover bg-center flex items-end"
      style={{ backgroundImage: "url('/images/misc/fancy-header.jpg')" }}
    >
      <div className="max-w-[1200px] mx-auto px-4 w-full pb-4">
        <h1
          className="text-[20px] text-[#1a171b] font-normal"
          style={{
            fontFamily: "'Fira Sans', Helvetica, Arial, sans-serif",
            textTransform: "none",
            fontWeight: 400,
            letterSpacing: "normal",
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
