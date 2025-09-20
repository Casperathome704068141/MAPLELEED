'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudLightning, CloudRain, CloudSnow, MapPin, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';

import styles from './weather-card.module.css';

type WeatherIcon = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm';

type WeatherState = {
  location: string;
  temperature: number;
  feelsLike: number | null;
  humidity: number | null;
  windSpeed: number | null;
  condition: string;
  sunrise?: string;
  sunset?: string;
  lastUpdated?: string;
  source: 'detected' | 'fallback';
  icon: WeatherIcon;
};

const DEFAULT_WEATHER: WeatherState = {
  location: 'Toronto, Canada',
  temperature: 18,
  feelsLike: 17,
  humidity: 56,
  windSpeed: 9,
  condition: 'Clear sky',
  sunrise: '6:20 AM',
  sunset: '8:45 PM',
  lastUpdated: undefined,
  source: 'fallback',
  icon: 'sun',
};

const TORONTO_COORDINATES = { latitude: 43.6532, longitude: -79.3832 } as const;

const iconComponents: Record<WeatherIcon, typeof Sun> = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

function interpretWeatherCode(code: number): WeatherIcon {
  if (code === 0) {
    return 'sun';
  }

  if ([1, 2, 3, 45, 48].includes(code)) {
    return 'cloud';
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) {
    return 'rain';
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return 'snow';
  }

  if ([95, 96, 99].includes(code)) {
    return 'storm';
  }

  return 'cloud';
}

function describeWeather(code: number): string {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
    case 2:
      return 'Mainly clear';
    case 3:
      return 'Overcast';
    case 45:
    case 48:
      return 'Foggy';
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return 'Light rain';
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return 'Snowfall';
    case 95:
    case 96:
    case 99:
      return 'Stormy';
    default:
      return 'Changing skies';
  }
}

function formatTime(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

async function fetchWeatherSnapshot(latitude: number, longitude: number) {
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', latitude.toString());
  weatherUrl.searchParams.set('longitude', longitude.toString());
  weatherUrl.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
  );
  weatherUrl.searchParams.set('daily', 'sunrise,sunset');
  weatherUrl.searchParams.set('timezone', 'auto');

  const [weatherResponse, locationResponse] = await Promise.all([
    fetch(weatherUrl.toString(), { cache: 'no-store' }),
    fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en`,
      { cache: 'no-store' },
    ),
  ]);

  if (!weatherResponse.ok) {
    throw new Error('Unable to fetch weather data');
  }

  const weatherData = await weatherResponse.json();

  const locationData = locationResponse.ok ? await locationResponse.json() : null;
  const locationResult = locationData?.results?.[0];
  const locationName = locationResult
    ? `${locationResult.name}, ${locationResult.country_code ?? locationResult.country}`
    : undefined;

  const code = Number(weatherData.current?.weather_code ?? 0);
  const icon = interpretWeatherCode(code);

  return {
    location: locationName,
    temperature: Number.isFinite(weatherData.current?.temperature_2m)
      ? Math.round(weatherData.current.temperature_2m)
      : undefined,
    feelsLike: Number.isFinite(weatherData.current?.apparent_temperature)
      ? Math.round(weatherData.current.apparent_temperature)
      : undefined,
    humidity: Number.isFinite(weatherData.current?.relative_humidity_2m)
      ? Math.round(weatherData.current.relative_humidity_2m)
      : undefined,
    windSpeed: Number.isFinite(weatherData.current?.wind_speed_10m)
      ? Math.round(weatherData.current.wind_speed_10m)
      : undefined,
    sunrise: formatTime(weatherData.daily?.sunrise?.[0]),
    sunset: formatTime(weatherData.daily?.sunset?.[0]),
    condition: describeWeather(code),
    icon,
  };
}

function buildState(snapshot: Awaited<ReturnType<typeof fetchWeatherSnapshot>>, source: 'detected' | 'fallback'): WeatherState {
  return {
    location: snapshot.location ?? DEFAULT_WEATHER.location,
    temperature: snapshot.temperature ?? DEFAULT_WEATHER.temperature,
    feelsLike: snapshot.feelsLike ?? DEFAULT_WEATHER.feelsLike,
    humidity: snapshot.humidity ?? DEFAULT_WEATHER.humidity,
    windSpeed: snapshot.windSpeed ?? DEFAULT_WEATHER.windSpeed,
    condition: snapshot.condition,
    sunrise: snapshot.sunrise ?? DEFAULT_WEATHER.sunrise,
    sunset: snapshot.sunset ?? DEFAULT_WEATHER.sunset,
    lastUpdated: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    source,
    icon: snapshot.icon,
  };
}

export function WeatherCard({ className }: { className?: string }) {
  const [weather, setWeather] = useState<WeatherState>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather(latitude: number, longitude: number, source: 'detected' | 'fallback') {
      try {
        setLoading(true);
        const snapshot = await fetchWeatherSnapshot(latitude, longitude);
        if (!cancelled) {
          setWeather(buildState(snapshot, source));
          setError(null);
        }
      } catch (err) {
        console.warn('Weather lookup failed', err);
        if (!cancelled) {
          setWeather(prev => ({
            ...DEFAULT_WEATHER,
            lastUpdated: new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
            source: 'fallback',
            icon: DEFAULT_WEATHER.icon,
          }));
          setError('Live weather unavailable. Showing Toronto conditions.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (typeof window === 'undefined') {
      return () => {
        cancelled = true;
      };
    }

    if (!('geolocation' in navigator)) {
      loadWeather(TORONTO_COORDINATES.latitude, TORONTO_COORDINATES.longitude, 'fallback');
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          loadWeather(position.coords.latitude, position.coords.longitude, 'detected');
        },
        () => {
          loadWeather(TORONTO_COORDINATES.latitude, TORONTO_COORDINATES.longitude, 'fallback');
        },
        { timeout: 7000 },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const IconComponent = iconComponents[weather.icon] ?? Sun;

  return (
    <div className={cn(styles.card, loading && styles.loading, className)} aria-live="polite">
      <div className={styles.landscapeSection}>
        <div className={styles.sky} />
        <div className={styles.sun} />
        <div className={styles.ocean}>
          <span className={cn(styles.reflection, styles.reflectionOne)} />
          <span className={cn(styles.reflection, styles.reflectionTwo)} />
          <span className={cn(styles.reflection, styles.reflectionThree)} />
          <span className={cn(styles.reflection, styles.reflectionFour)} />
          <span className={cn(styles.reflection, styles.reflectionFive)} />
        </div>
        <div className={styles.hillThree} />
        <div className={styles.hillFour} />
        <div className={styles.hillOne}>
          <div className={styles.shadowHillOne} />
        </div>
        <div className={styles.hillTwo}>
          <div className={styles.shadowHillTwo} />
        </div>
        <div className={cn(styles.treeBase, styles.treeOne)} />
        <div className={cn(styles.treeBase, styles.treeTwo)} />
        <div className={cn(styles.treeBase, styles.treeThree)} />
        <div className={styles.filterLayer} />
        <div className={styles.weatherInfo}>
          <div className={styles.leftSide}>
            <div className={styles.temperature}>{Math.round(weather.temperature)}°</div>
            <span>{weather.condition}</span>
          </div>
          <div className={styles.icon}>
            <IconComponent size={40} strokeWidth={1.5} color="white" />
          </div>
          <div className={styles.location}>
            <MapPin size={14} strokeWidth={2} />
            <span>{weather.location}</span>
          </div>
        </div>
      </div>
      <div className={styles.contentSection}>
        <div className={styles.forecast}>
          <div className={styles.forecastRow}>
            <span>Feels like</span>
            <span>{weather.feelsLike != null ? `${weather.feelsLike}°` : '—'}</span>
          </div>
          <div className={styles.separator} />
          <div className={styles.forecastRow}>
            <span>Humidity</span>
            <span>{weather.humidity != null ? `${weather.humidity}%` : '—'}</span>
          </div>
          <div className={styles.separator} />
          <div className={styles.forecastRow}>
            <span>Wind</span>
            <span>{weather.windSpeed != null ? `${weather.windSpeed} km/h` : '—'}</span>
          </div>
        </div>
        {(weather.sunrise || weather.sunset) && (
          <p className={styles.statusNote}>
            {weather.sunrise ? `Sunrise ${weather.sunrise}` : ''}
            {weather.sunrise && weather.sunset ? ' • ' : ''}
            {weather.sunset ? `Sunset ${weather.sunset}` : ''}
          </p>
        )}
        {weather.lastUpdated && (
          <p className={styles.statusNote}>
            {weather.source === 'detected' ? 'Local weather' : 'Toronto baseline'} · Updated {weather.lastUpdated}
          </p>
        )}
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}
