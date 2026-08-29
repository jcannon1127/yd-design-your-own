import type { YdProductAttribute } from "@shared/yd";

interface SizeSelectorProps {
  attributes: YdProductAttribute[];
  selections: Record<string, string>;
  onChange: (attrId: string, value: string) => void;
  compact?: boolean;
}

export default function SizeSelector({
  attributes,
  selections,
  onChange,
  compact = false,
}: SizeSelectorProps) {
  if (attributes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground font-body text-center py-2">
        Loading sizes from YD.com…
      </p>
    );
  }

  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
      {attributes.map((attr) => (
        <div key={attr.id}>
          <label className="block text-xs font-body font-medium text-foreground mb-1.5">
            {attr.label}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {attr.options.map((option) => {
              const selected = selections[attr.id] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={!option.available}
                  onClick={() => onChange(attr.id, option.value)}
                  title={option.available ? option.label : `${option.label} — out of stock`}
                  className={`
                    min-w-[2.5rem] px-2.5 py-1.5 rounded-md text-xs font-body font-medium
                    transition-all duration-150 border
                    ${selected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : option.available
                        ? "bg-background text-foreground border-border hover:border-accent hover:text-accent"
                        : "bg-secondary/50 text-muted-foreground border-border line-through cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
