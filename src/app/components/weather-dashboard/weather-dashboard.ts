import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, Subscription, EMPTY } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { WeatherService } from '../../services/weather.service';
import { FavoritesService } from '../../services/favorites.service';
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
  favorites: string[] = [];
  error: string | null = null;
  loading: boolean = false;

  private searchSubject = new Subject<string | { lat: number; lon: number }>();
  private searchSubscription?: Subscription;
  private favSubscription?: Subscription;

  constructor(
    private weatherService: WeatherService,
    private favoritesService: FavoritesService
  ) { }

  ngOnInit(): void {
    this.favSubscription = this.favoritesService.getFavorites().subscribe((favs: string[]) => {
      this.favorites = favs;
    });

    this.searchSubscription = this.searchSubject.pipe(
      tap(() => {
        this.loading = true;
        this.error = null;
      }),
      switchMap(query => {
        const request = typeof query === 'string'
          ? forkJoin({
            weather: this.weatherService.getWeather(query),
            forecast: this.weatherService.getForecast(query)
          })
          : forkJoin({
            weather: this.weatherService.getWeatherByCoords(query.lat, query.lon),
            forecast: this.weatherService.getForecastByCoords(query.lat, query.lon)
          });

        return request.pipe(
          catchError(err => {
            this.error = 'Weather data unavailable. Please try again.';
            this.loading = false;
            this.weatherData = undefined;
            this.forecastData = undefined;
            return EMPTY;
          })
        );
      })
    ).subscribe(result => {
      this.weatherData = result.weather;
      this.forecastData = result.forecast;
      this.loading = false;
    });

    this.getUserLocation();
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.searchSubject.next({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          console.log('User denied geolocation or error occurred.');
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  handleCitySearch(city: string): void {
    this.searchSubject.next(city);
  }

  removeFavorite(city: string, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavorite(city);
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
