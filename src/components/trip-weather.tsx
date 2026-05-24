import { useState, useEffect } from "react";
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Loader2, MapPin, Sun, Thermometer, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  condition: string;
  windSpeed: number;
  isDay: boolean;
}

export function TripWeather({ destination, startDate }: { destination: string; startDate: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      if (!destination) return;
      setLoading(true);
      try {
        // 1. Get Coordinates using Nominatim
        const query = encodeURIComponent(destination);
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          const lat = geoData[0].lat;
          const lon = geoData[0].lon;

          // 2. Fetch Weather using Open-Meteo (Free, No API Key)
          // We fetch the forecast, but if the trip is far in the past/future, it just falls back to current/closest forecast.
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code,wind_speed_10m`);
          const weatherData = await weatherRes.json();

          if (weatherData && weatherData.current) {
            
            // WMO Weather interpretation codes
            const code = weatherData.current.weather_code;
            let condition = "Clear";
            if (code >= 1 && code <= 3) condition = "Partly Cloudy";
            if (code >= 45 && code <= 48) condition = "Foggy";
            if (code >= 51 && code <= 67) condition = "Rainy";
            if (code >= 71 && code <= 86) condition = "Snowy";
            if (code >= 95) condition = "Thunderstorm";

            setWeather({
              temp: Math.round(weatherData.current.temperature_2m),
              condition,
              windSpeed: Math.round(weatherData.current.wind_speed_10m),
              isDay: weatherData.current.is_day === 1
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [destination]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = () => {
    if (weather.condition === "Clear") return <Sun className={`w-8 h-8 ${weather.isDay ? "text-amber-500" : "text-slate-400"}`} />;
    if (weather.condition === "Partly Cloudy") return <Cloud className="w-8 h-8 text-slate-400" />;
    if (weather.condition === "Rainy") return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (weather.condition === "Snowy") return <CloudSnow className="w-8 h-8 text-sky-300" />;
    if (weather.condition === "Thunderstorm") return <CloudLightning className="w-8 h-8 text-violet-500" />;
    return <CloudDrizzle className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700/50 rounded-2xl border border-blue-100 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <WeatherIcon />
        </div>
        <div>
          <div className="flex items-center gap-1">
            <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{weather.temp}°C</h4>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{weather.condition}</p>
        </div>
      </div>
      
      <div className="space-y-1 text-right">
        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Thermometer className="w-3.5 h-3.5" />
          <span>Forecast</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Wind className="w-3.5 h-3.5" />
          <span>{weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}
