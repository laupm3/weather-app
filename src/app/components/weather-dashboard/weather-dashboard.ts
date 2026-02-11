import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, Subscription, EMPTY } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
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
  favoriteWeatherData: WeatherData[] = [];
  error: string | null = null;
  loading: boolean = false;
  units: string = 'metric';
  private lastQuery: string | { lat: number; lon: number } | null = null;

  private searchSubject = new Subject<string | { lat: number; lon: number }>();
  private searchSubscription?: Subscription;
  private favSubscription?: Subscription;

  constructor(
    private weatherService: WeatherService,
    private favoritesService: FavoritesService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    const savedUnits = localStorage.getItem('weather-units');
    if (savedUnits) {
      this.units = savedUnits;
    }
  }

  ngOnInit(): void {
    this.favSubscription = this.favoritesService.getFavorites().pipe(
      switchMap((favs: string[]) => {
        this.zone.run(() => {
          this.favorites = favs;
          this.cdr.detectChanges();
        });

        if (favs.length === 0) {
          this.zone.run(() => {
            this.favoriteWeatherData = [];
            this.cdr.detectChanges();
          });
          return EMPTY;
        }

        const requests = favs.map(city => this.weatherService.getWeather(city, this.units).pipe(
          catchError(() => EMPTY)
        ));
        return forkJoin(requests);
      })
    ).subscribe((data: WeatherData[]) => {
      this.zone.run(() => {
        this.favoriteWeatherData = data;
        this.cdr.detectChanges();
      });
    });

    this.searchSubscription = this.searchSubject.pipe(
      tap(() => {
        this.zone.run(() => {
          this.loading = true;
          this.error = null;
          this.cdr.detectChanges();
        });
      }),
      switchMap(query => {
        this.lastQuery = query;
        const request = typeof query === 'string'
          ? forkJoin({
            weather: this.weatherService.getWeather(query, this.units),
            forecast: this.weatherService.getForecast(query, this.units)
          })
          : forkJoin({
            weather: this.weatherService.getWeatherByCoords(query.lat, query.lon, this.units),
            forecast: this.weatherService.getForecastByCoords(query.lat, query.lon, this.units)
          });

        return request.pipe(
          catchError(err => {
            this.zone.run(() => {
              this.error = 'Weather data unavailable. Please try again.';
              this.loading = false;
              this.weatherData = undefined;
              this.forecastData = undefined;
              this.cdr.detectChanges();
            });
            return EMPTY;
          })
        );
      })
    ).subscribe(result => {
      this.zone.run(() => {
        this.weatherData = result.weather;
        this.forecastData = result.forecast;
        this.loading = false;
        this.cdr.detectChanges();
      });
    });

    this.getUserLocation();
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.zone.run(() => {
            this.searchSubject.next({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          });
        },
        () => {
          this.zone.run(() => this.cdr.detectChanges());
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.favSubscription?.unsubscribe();
  }

  handleCitySearch(city: string): void {
    this.searchSubject.next(city);
  }

  removeFavorite(city: string, event: Event): void {
    event.stopPropagation();
    this.favoritesService.removeFavorite(city);
  }

  toggleUnits(): void {
    this.units = this.units === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('weather-units', this.units);

    // Si tenemos una búsqueda activa, la refrescamos con las nuevas unidades
    if (this.lastQuery) {
      this.searchSubject.next(this.lastQuery);
    }

    // También refrescamos el clima de los favoritos
    this.favoritesService.refresh(); // Asumiendo que refresh dispara el observable de favoritos de nuevo
    // O simplemente forzamos una recarga manual de favoriteWeatherData si refresh no existe
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
