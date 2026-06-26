"use client";

export interface PacketaPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
}

interface Props {
  country?: string;
  onSelect: (point: PacketaPoint) => void;
  selected?: PacketaPoint | null;
}

declare global {
  interface Window {
    Packeta?: {
      Widget: {
        pick: (
          apiKey: string,
          callback: (point: PacketaPoint | null) => void,
          options?: Record<string, string>
        ) => void;
      };
    };
  }
}

const lbl = "block text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-2";

export default function PacketaPickupSelector({ country = "sk", onSelect, selected }: Props) {
  const openWidget = () => {
    if (!window.Packeta?.Widget) {
      alert("Packeta widget is not loaded yet. Please try again in a moment.");
      return;
    }

    window.Packeta.Widget.pick(
      process.env.NEXT_PUBLIC_PACKETA_KEY ?? "",
      (point) => {
        if (!point) return;
        onSelect({
          id:     String(point.id),
          name:   point.name,
          city:   point.city,
          street: point.street,
          zip:    point.zip,
        });
      },
      {
        country,
        language: "en",
      }
    );
  };

  return (
    <div className="mt-5">
      <label className={lbl}>Packeta Pickup Point *</label>

      <button
        type="button"
        onClick={openWidget}
        className="w-full border border-white/10 hover:border-white/30 px-4 py-3 text-left text-sm font-mono text-zinc-400 hover:text-white transition-all flex items-center justify-between group"
      >
        <span>
          {selected
            ? selected.name
            : "Select pickup point →"}
        </span>
        <span className="text-[9px] tracking-[0.25em] uppercase font-mono text-zinc-700 group-hover:text-zinc-400 transition-colors">
          {selected ? "change" : "open map"}
        </span>
      </button>

      {selected && (
        <div className="mt-3 border border-white/10 px-4 py-3">
          <p className="text-[8px] tracking-[0.3em] uppercase font-mono text-zinc-600 mb-2">
            Selected Pickup Point
          </p>
          <p className="text-[10px] font-mono text-white">{selected.name}</p>
          <p className="text-[8px] font-mono text-zinc-500">
            {selected.street}, {selected.zip} {selected.city}
          </p>
          <p className="text-[7px] font-mono text-zinc-700 mt-0.5">ID: {selected.id}</p>
        </div>
      )}
    </div>
  );
}
