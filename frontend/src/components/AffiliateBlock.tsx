// ---------------------------------------------------------------------------
// AffiliateBlock — shown on dog detail pages below the share kit
//
// Amazon tag: waitingthelon-20
// Chewy: direct product links
//
// Products are chosen based on dog size. Links open in new tab with
// rel="noopener noreferrer sponsored" per FTC + Amazon ToS.
// ---------------------------------------------------------------------------

interface Props {
  dogName: string;
  size: string | null; // small | medium | large | xlarge
}

interface Product {
  name: string;
  store: "amazon" | "chewy";
  url: string;
  price: string;
  emoji: string;
}

function getProducts(size: string | null): Product[] {
  const isSmall = size === "small";
  const isLarge = size === "large" || size === "xlarge";

  return [
    {
      name: "New Pet Starter Bundle",
      store: "amazon",
      url: `https://www.amazon.com/s?k=${isSmall ? "small+dog" : isLarge ? "large+dog" : "medium+dog"}+starter+kit&tag=waitingthelon-20`,
      price: "Shop Amazon →",
      emoji: "🎁",
    },
    {
      name: isSmall ? "Small Dog Harness" : isLarge ? "Heavy-Duty Dog Harness" : "Adjustable Dog Harness",
      store: "amazon",
      url: `https://www.amazon.com/s?k=${isSmall ? "small+dog+harness" : isLarge ? "large+dog+harness" : "dog+harness+medium"}&tag=waitingthelon-20`,
      price: "Shop Amazon →",
      emoji: "🦺",
    },
    {
      name: isSmall ? "Small Breed Dry Food" : isLarge ? "Large Breed Dry Food" : "Adult Dry Dog Food",
      store: "chewy",
      url: isSmall
        ? "https://www.chewy.com/b/small-breed-food-332"
        : isLarge
        ? "https://www.chewy.com/b/large-breed-food-334"
        : "https://www.chewy.com/b/dry-food-294",
      price: "Shop Chewy →",
      emoji: "🥣",
    },
    {
      name: "Cozy Dog Bed",
      store: "amazon",
      url: `https://www.amazon.com/s?k=${isSmall ? "small+dog+bed" : isLarge ? "large+orthopedic+dog+bed" : "dog+bed"}&tag=waitingthelon-20`,
      price: "Shop Amazon →",
      emoji: "🛏️",
    },
    {
      name: "Dog Training Treats",
      store: "chewy",
      url: "https://www.chewy.com/b/training-treats-306",
      price: "Shop Chewy →",
      emoji: "🦴",
    },
    {
      name: "Interactive Puzzle Toy",
      store: "amazon",
      url: "https://www.amazon.com/s?k=dog+puzzle+toy+interactive&tag=waitingthelon-20",
      price: "Shop Amazon →",
      emoji: "🧩",
    },
  ];
}

export function AffiliateBlock({ dogName, size }: Props) {
  const products = getProducts(size);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h2 className="font-display text-lg font-bold text-wtl-navy mb-1">
        Getting ready for {dogName}?
      </h2>
      <p className="text-xs text-wtl-muted mb-4">
        Everything you need for a new dog. Affiliate links help keep this site free.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {products.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex flex-col gap-1 border border-gray-100 rounded-lg p-3 hover:border-wtl-coral hover:bg-wtl-coral/5 transition-colors group"
          >
            <span className="text-xl">{p.emoji}</span>
            <span className="text-xs font-semibold text-wtl-navy leading-tight group-hover:text-wtl-coral transition-colors line-clamp-2">
              {p.name}
            </span>
            <span className={`text-xs font-bold mt-auto ${p.store === "amazon" ? "text-orange-500" : "text-blue-500"}`}>
              {p.price}
            </span>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        WaitingTheLongest.com is a participant in the Amazon Services LLC Associates Program and other affiliate programs.
      </p>
    </div>
  );
}
