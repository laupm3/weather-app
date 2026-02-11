import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { SearchBar } from '../search-bar/search-bar';
import { WeatherCard } from '../weather-card/weather-card';
import { Forecast } from '../forecast/forecast';
import { WeatherData, ForecastData } from '../../models/weather.model';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule, SearchBar, WeatherCard, Forecast],
  templateUrl: './weather-dashboard.html',
  styleUrl: './weather-dashboard.css',
})
export class WeatherDashboard {
  weatherData?: WeatherData;
  forecastData?: ForecastData;
  error: string | null = null;
  loading: boolean = false;

  constructor(private weatherService: WeatherService) { }

  handleCitySearch(city: string): void {
    this.loading = true;
    this.error = null;

    this.weatherService.getWeather(city).subscribe({
      next: (data: WeatherData) => {
        this.weatherData = data;
        this.getForecastData(city);
      },
      error: (err: any) => {
        this.error = 'City not found. Please try again.';
        this.loading = false;
        this.weatherData = undefined;
        this.forecastData = undefined;
      }
    });
  }

  getForecastData(city: string): void {
    this.weatherService.getForecast(city).subscribe({
      next: (data: ForecastData) => {
        this.forecastData = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not fetch forecast data.';
        this.loading = false;
      }
    });
  }

  getWeatherClass(): string {
    if (!this.weatherData) return 'default-bg';
    const main = this.weatherData.weather[0].main.toLowerCase();

    if (main.includes('clear')) return 'clear-sky';
    if (main.includes('cloud')) return 'cloudy-sky';
    if (main.includes('rain') || main.includes('drizzle')) return 'rainy-sky';
    if (main.includes('snow')) return 'snowy-sky';
    if (main.includes('thunderstorm')) return 'thunderstorm-sky';

    return 'default-bg';
  }
}
