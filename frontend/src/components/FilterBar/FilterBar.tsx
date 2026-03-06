type FilterBarProps = {
  tags: string[];
  activeTag: string;
  onChange: (tag: string) => void;
};

export function FilterBar({ tags, activeTag, onChange }: FilterBarProps) {
  return (
    <div className="filter-bar" role="toolbar" aria-label="Project technology filters">
      {tags.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            className={`filter-pill ${isActive ? "is-active" : ""}`}
            aria-label={`Filter by ${tag}`}
            aria-pressed={isActive}
            onClick={() => onChange(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
