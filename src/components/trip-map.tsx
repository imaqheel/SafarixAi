import { useEffect, useState } from "react";
import { Loader2, MapPin, ExternalLink } from "lucide-react";

export function TripMap({ destination }: { destination: string }) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoordinates() {
      if (!destination) return;
      setLoading(true);
      try {
        const query = encodeURIComponent(destination);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setCoordinates({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        } else {
          setCoordinates(null);
        }
      } catch {
        setCoordinates(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCoordinates();
  }, [destination]);

  if (loading) {
    return (
      <div className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-sm text-muted-foreground font-medium">Loading map...</span>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="w-full h-[280px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
        <MapPin className="w-10 h-10 text-slate-400 mb-3" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Map Unavailable</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          We couldn't locate coordinates for {destination}.
        </p>
      </div>
    );
  }

  const { lat, lon } = coordinates;
  // OpenStreetMap tile-based embed via iframe — no JS library, no crashes
  const bbox = `${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const fullMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      <iframe
        title={`Map of ${destination}`}
        src={iframeSrc}
        width="100%"
        height="280"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        allowFullScreen
      />
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-primary" />
          {destination}
        </span>
        <a
          href={fullMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Open full map <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
