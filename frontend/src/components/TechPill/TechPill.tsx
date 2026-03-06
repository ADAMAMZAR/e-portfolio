import "./TechPill.css";

type TechPillProps = {
  label: string;
};

function hashColor(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 75% 45%)`;
}

export function TechPill({ label }: TechPillProps) {
  return (
    <span className="tech-pill" style={{ borderColor: hashColor(label) }}>
      {label}
    </span>
  );
}
