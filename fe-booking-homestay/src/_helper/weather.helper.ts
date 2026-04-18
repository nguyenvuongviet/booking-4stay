export type DailyWeather = {
    date: string;
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
    icon: string;
    description: string;
    humidity: number;
    windSpeed: number;
};

export type WeatherGroup =
    | "sunny"
    | "cloudy"
    | "rain"
    | "storm"
    | "snow"
    | "fog";

export interface WeatherUI {
    icon: string;
    color: string;
    label: string;
}

// map icon -> group
export function mapWeatherIcon(icon: string): WeatherGroup {
    if (!icon) return "cloudy";

    if (icon.startsWith("01")) return "sunny";
    if (icon.startsWith("02") || icon.startsWith("03") || icon.startsWith("04"))
        return "cloudy";
    if (icon.startsWith("09") || icon.startsWith("10")) return "rain";
    if (icon.startsWith("11")) return "storm";
    if (icon.startsWith("13")) return "snow";
    if (icon.startsWith("50")) return "fog";

    return "cloudy";
}

export function getWeatherUI(icon: string): WeatherUI {
    const group = mapWeatherIcon(icon);

    const map: Record<WeatherGroup, WeatherUI> = {
        sunny: {
            icon: "☀️",
            color: "text-yellow-500",
            label: "Nắng",
        },
        cloudy: {
            icon: "☁️",
            color: "text-gray-400",
            label: "Nhiều mây",
        },
        rain: {
            icon: "🌧️",
            color: "text-blue-500",
            label: "Mưa",
        },
        storm: {
            icon: "⛈️",
            color: "text-purple-500",
            label: "Giông",
        },
        snow: {
            icon: "❄️",
            color: "text-cyan-400",
            label: "Tuyết",
        },
        fog: {
            icon: "🌫️",
            color: "text-gray-500",
            label: "Sương mù",
        },
    };

    return map[group];
}

const WEATHER_DESCRIPTION_MAP: Record<string, string> = {
    "clear sky": "Trời quang",

    "few clouds": "Ít mây",
    "scattered clouds": "Mây rải rác",
    "broken clouds": "Nhiều mây",
    "overcast clouds": "Trời nhiều mây",

    "light rain": "Mưa nhẹ",
    "moderate rain": "Mưa vừa",
    "heavy intensity rain": "Mưa to",
    "very heavy rain": "Mưa rất to",
    "extreme rain": "Mưa cực lớn",
    "shower rain": "Mưa rào",

    "thunderstorm": "Dông",
    "thunderstorm with light rain": "Dông nhẹ",
    "thunderstorm with rain": "Dông có mưa",
    "thunderstorm with heavy rain": "Dông lớn",

    "light intensity drizzle": "Mưa phùn nhẹ",
    "drizzle": "Mưa phùn",
    "heavy intensity drizzle": "Mưa phùn nặng",

    "light snow": "Tuyết nhẹ",
    "snow": "Tuyết",
    "heavy snow": "Tuyết dày",

    "mist": "Sương mù nhẹ",
    "fog": "Sương mù",
    "haze": "Sương mờ",
    "dust": "Bụi",
    "smoke": "Khói",
    "sand": "Cát",
    "ash": "Tro",
    "squall": "Gió giật",
    "tornado": "Lốc xoáy",
};

export const translateWeather = (desc?: string) => {
    if (!desc) return "";

    return WEATHER_DESCRIPTION_MAP[desc.toLowerCase()] || desc;
};

// timezone
export function formatLocalDate(date: Date) {
    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );
    return local.toISOString().split("T")[0]; // yyyy-MM-dd
}

export const formatDateKey = (timestamp: number) => {
    return new Date(timestamp * 1000).toISOString().split("T")[0];
};

export const getMostFrequentIcon = (icons: Record<string, number>) => {
    return Object.entries(icons).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
};

export const calculateAverage = (nums: number[]) => {
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
};

export const groupWeatherByDay = (list: any[]): DailyWeather[] => {
    const map = new Map<
        string,
        {
            temps: number[];
            minTemps: number[];
            maxTemps: number[];
            humidity: number[];
            wind: number[];
            icons: Record<string, number>;
            descriptions: Record<string, number>;
        }
    >();

    list.forEach((item) => {
        const date = formatDateKey(item.dt);

        if (!map.has(date)) {
            map.set(date, {
                temps: [],
                minTemps: [],
                maxTemps: [],
                humidity: [],
                wind: [],
                icons: {},
                descriptions: {},
            });
        }

        const entry = map.get(date)!;

        // temp
        entry.temps.push(item.main.temp);
        entry.minTemps.push(item.main.temp_min);
        entry.maxTemps.push(item.main.temp_max);
        entry.humidity.push(item.main.humidity);
        entry.wind.push(item.wind.speed);

        // icon
        const icon = item.weather?.[0]?.icon;
        const desc = item.weather?.[0]?.description;

        if (icon) entry.icons[icon] = (entry.icons[icon] || 0) + 1;
        if (desc) entry.descriptions[desc] = (entry.descriptions[desc] || 0) + 1;


    });


    return Array.from(map.entries()).map(([date, value]) => ({
        date,
        avgTemp: calculateAverage(value.temps),
        minTemp: Math.min(...value.minTemps),
        maxTemp: Math.max(...value.maxTemps),
        humidity: calculateAverage(value.humidity),
        windSpeed: calculateAverage(value.wind),
        icon: getMostFrequentIcon(value.icons),
        description: translateWeather(
            getMostFrequentIcon(value.descriptions)
        ),
    }));
};