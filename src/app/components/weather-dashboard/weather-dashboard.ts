import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, Subscription, EMPTY } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
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
export class WeatherDashboard implements OnInit, OnDestroy {
  weatherData?: WeatherData;
  forecastData?: ForecastData;
  error: string | null = null;
  loading: boolean = false;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      tap(() => {
        this.loading = true;
        this.error = null;
      }),
      switchMap(city =>
        forkJoin({
          weather: this.weatherService.getWeather(city),
          forecast: this.weatherService.getForecast(city)
        }).pipe(
          catchError(err => {
            this.error = 'City not found or service unavailable.';
            this.loading = false;
            this.weatherData = undefined;
            this.forecastData = undefined;
            console.error('Weather error:', err);
            return EMPTY;
          })
        )
      )
    ).subscribe(result => {
      this.weatherData = result.weather;
      this.forecastData = result.forecast;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  handleCitySearch(city: string): void {
    this.searchSubject.next(city);
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
