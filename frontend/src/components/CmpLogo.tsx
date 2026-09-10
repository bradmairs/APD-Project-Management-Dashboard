import cmpLogo from "../assets/cmp-logo.png";

export default function CmpLogo({ className = "h-14" }: { className?: string }) {
  return <img src={cmpLogo} alt="CMP Consulting Group" className={`${className} w-auto`} />;
}
