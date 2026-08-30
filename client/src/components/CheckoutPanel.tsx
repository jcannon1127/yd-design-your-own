import { useEffect, useMemo, useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import SizeSelector from "./SizeSelector";
import type { Style, Print } from "@/lib/data";
import type { YdProductAttribute } from "@shared/yd";
import { buildProductPageUrl, isReadyForCheckout } from "@shared/yd";

interface CheckoutPanelProps {
  style: Style | null;
  print: Print | null;
  productUrl: string | null;
  productId: string | null;
  attributes: YdProductAttribute[];
  loading: boolean;
  isCustomPrint: boolean;
  hasProduct: boolean;
}

export default function CheckoutPanel({
  style,
  print,
  productUrl,
  productId,
  attributes,
  loading,
  isCustomPrint,
  hasProduct,
}: CheckoutPanelProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelections({});
  }, [style?.id, print?.urlName, productUrl]);

  const ready = useMemo(
    () => isReadyForCheckout(attributes, selections),
    [attributes, selections]
  );

  const checkoutUrl = useMemo(() => {
    if (!productUrl || !productId || !ready) return null;
    return buildProductPageUrl(productUrl, productId, selections);
  }, [productUrl, productId, ready, selections]);

  if (!style || !print) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-md font-body font-medium text-sm
                   bg-secondary text-muted-foreground cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        <ShoppingBag size={16} />
        Complete your design to continue
      </button>
    );
  }

  // Custom / isNew prints are not on YD.com — keep Request This Print.
  // Do not deep-link or turn this into Add to Cart.
  if (isCustomPrint) {
    return (
      <div className="space-y-3">
        <div className="p-3 rounded-md bg-secondary/60 border border-border">
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            <span className="text-primary font-medium">{print.name}</span> is a custom print preview.
            Contact Yoga Democracy to request this print on your favorite style.
          </p>
        </div>
        <a
          href="https://www.yogademocracy.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-md font-body font-medium text-sm
                     bg-primary text-primary-foreground
                     flex items-center justify-center gap-2
                     hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Request This Print
          <ExternalLink size={12} className="opacity-60" />
        </a>
      </div>
    );
  }

  if (loading && !hasProduct) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-md font-body font-medium text-sm
                   bg-secondary text-muted-foreground cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        <div className="w-4 h-4 border-2 border-muted-foreground/40 border-t-transparent rounded-full animate-spin" />
        Finding your product on YD.com…
      </button>
    );
  }

  if (!hasProduct || !productUrl) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-body text-center">
          We couldn&apos;t find this exact style + print combo on YD.com right now.
          Try a different print or browse the shop directly.
        </p>
        <a
          href={`https://www.yogademocracy.com/search?q=${encodeURIComponent(`${style.name} ${print.name}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-md font-body font-medium text-sm
                     bg-secondary text-foreground
                     flex items-center justify-center gap-2
                     hover:bg-secondary/80 transition-all duration-200"
        >
          Search on YD.com
          <ExternalLink size={12} className="opacity-60" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SizeSelector
        attributes={attributes}
        selections={selections}
        onChange={(attrId, value) =>
          setSelections((prev) => ({ ...prev, [attrId]: value }))
        }
      />

      <a
        href={checkoutUrl ?? productUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!ready}
        onClick={(e) => {
          if (!ready) e.preventDefault();
        }}
        className={`
          w-full py-4 rounded-md font-body font-medium text-sm
          flex items-center justify-center gap-2 transition-all duration-200
          ${ready
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md"
            : "bg-secondary text-muted-foreground cursor-not-allowed pointer-events-none"
          }
        `}
      >
        <ShoppingBag size={16} />
        {ready ? "Add to Cart on YD.com" : "Select your size to continue"}
        <ExternalLink size={12} className="opacity-60" />
      </a>

      <p className="text-[10px] text-muted-foreground font-body text-center leading-relaxed">
        You&apos;ll finish checkout on yogademocracy.com with your size pre-selected.
      </p>
    </div>
  );
}
