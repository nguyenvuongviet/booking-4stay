import { DailyWeather, groupWeatherByDay } from "@/_helper/weather.helper";
import { useEffect, useMemo, useState } from "react";

export const useWeather = (lat?: number | string, lon?: number | string) => {
  const [data, setData] = useState<DailyWeather[]>([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (!lat || !lon) {
          lat = 10.7577;
          lon = 106.6613;
          return;
        }

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric`,
        );

        const result = await res.json();
        const daily = groupWeatherByDay(result?.list || []);
        setData(daily);
        console.log("weather: ", lat, lon);
      } catch (err) {
        console.error(err);
        setData([]);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  const weatherMap = useMemo(() => {
    const map = new Map<string, DailyWeather>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  return { data, weatherMap };
};
