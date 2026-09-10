// A text wordmark rather than an image — this app has no actual CMP brand
// asset to work with, unlike Goulburn Valley Water's real logo file. Swap
// this for an <img> once CMP supplies one, the same way gvw-logo.png is
// used elsewhere.
export default function CmpLogo({ className = "h-10" }: { className?: string }) {
  return (
    <div
      className={`${className} aspect-square rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center tracking-tight`}
      aria-label="CMP"
    >
      CMP
    </div>
  );
}
