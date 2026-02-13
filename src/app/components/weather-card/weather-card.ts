import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherData } from '../../models/weather.model';
import { FavoritesService } from '../../services/favorites.service';
import { LanguageService } from '../../services/language.service';
import { WeatherIcon } from '../weather-icon/weather-icon';

/**
 * Displays the current weather summary for a specific city.
 * Features favorites integration and responsive glassmorphism design.
 */
@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule, WeatherIcon],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css',
  providers: [DecimalPipe]
})
export class WeatherCard implements OnInit, OnDestroy {
  @Input() weatherData?: WeatherData;
  @Input() units: string = 'metric';
  @Input() loading: boolean = false;
  @Output() favoriteToggled = new EventEmitter<void>();
  private langSubscription?: any;

  constructor(
    private favoritesService: FavoritesService,
    public langService: LanguageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  isFavorite(): boolean {
    return !!this.weatherData && this.favoritesService.isFavorite(this.weatherData.name);
  }

  toggleFavorite(): void {
    if (!this.weatherData) return;
    const cityName = this.weatherData.name;
    if (this.isFavorite()) {
      this.favoritesService.removeFavorite(cityName);
    } else {
      this.favoritesService.addFavorite(cityName);
    }
    this.favoriteToggled.emit();
  }
}
