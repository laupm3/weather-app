import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, Subscription, EMPTY, combineLatest } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { WeatherService } from '../../services/weather.service';
import { FavoritesService } from '../../services/favorites.service';
import { LanguageService } from '../../services/language.service';
import { SearchBar } from '../search-bar/search-bar';
import { WeatherCard } from '../weather-card/weather-card';
import { Forecast } from '../forecast/forecast';
import { HourlyChart } from '../hourly-chart/hourly-chart';
import { SunArch } from '../sun-arch/sun-arch';
import { WeatherIcon } from '../weather-icon/weather-icon';
import { WeatherData, ForecastData } from '../../models/weather.model';

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule, SearchBar, WeatherCard, Forecast, HourlyChart, SunArch, WeatherIcon],
  templateUrl: './weather-dashboard.html',
  styleUrl: './weather-dashboard.css',
})
export class WeatherDashboard implements OnInit, OnDestroy {
  weatherData?: WeatherData;
  forecastData?: ForecastData; // Main weather data signals
  favorites: string[] = [];
  favoriteWeatherData: WeatherData[] = [];
  error: string | null = null;
  loading: boolean = false;
  units: string = 'metric';

  // Parallax offsets
  offsetX: number = 0;
  offsetY: number = 0;

  private lastQuery: string | { lat: number; lon: number } | null = null;

  private searchSubject = new Subject<string | { lat: number; lon: number }>();
  private searchSubscription?: Subscription;
  private favSubscription?: Subscription;

  constructor(
    private weatherService: WeatherService,
    public favoritesService: FavoritesService,
    public langService: LanguageService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.units = this.detectUnits();
  }

  private detectUnits(): string {
    const savedUnits = localStorage.getItem('weather-units');
    if (savedUnits) return savedUnits;

    // Smart detection: US, Liberia, Myanmar use Imperial
    const imperialCountries = ['US', 'LR', 'MM'];
    const userLocale = navigator.language.split('-')[1] || '';

    if (imperialCountries.includes(userLocale.toUpperCase())) {
      return 'imperial';
    }

    return 'metric';
  }

  ngOnInit(): void {
    this.favSubscription = combineLatest([
      this.favoritesService.getFavorites(),
      this.langService.currentLang$
    ]).pipe(
      switchMap(([favs, lang]) => {
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

        const requests = favs.map((city: string) => this.weatherService.getWeather(city, this.units, lang).pipe(
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
            weather: this.weatherService.getWeather(query, this.units, this.langService.getCurrentLang()),
            forecast: this.weatherService.getForecast(query, this.units, this.langService.getCurrentLang())
          })
          : forkJoin({
            weather: this.weatherService.getWeatherByCoords(query.lat, query.lon, this.units, this.langService.getCurrentLang()),
            forecast: this.weatherService.getForecastByCoords(query.lat, query.lon, this.units, this.langService.getCurrentLang())
          });

        return request.pipe(
          catchError(err => {
            this.zone.run(() => {
              this.error = this.langService.get('ERROR_MSG');
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

    // Refrescar al cambiar el idioma
    this.langService.currentLang$.subscribe(() => {
      if (this.lastQuery) {
        this.searchSubject.next(this.lastQuery);
      }
    });

    this.getUserLocation();
    this.initParallax();
  }

  private initParallax(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        // Suave interpolación o simplemente actualización
        this.offsetX = x * 30; // 30px max mov
        this.offsetY = y * 30;

        // Actualizamos directamente el estilo para máximo rendimiento
        const blobs = document.querySelectorAll('.blob');
        blobs.forEach((blob: any, index) => {
          const factor = (index + 1) * 0.5;
          blob.style.transform = `translate(${this.offsetX * factor}px, ${this.offsetY * factor}px)`;
        });
      });
    });
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
    this.favoritesService.refresh();
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
