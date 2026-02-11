import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherData } from '../../models/weather.model';
import { FavoritesService } from '../../services/favorites.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css',
  providers: [DecimalPipe]
})
export class WeatherCard {
  @Input() weatherData?: WeatherData;
  @Input() units: string = 'metric';
  @Output() favoriteToggled = new EventEmitter<void>();

  constructor(
    private favoritesService: FavoritesService,
    public langService: LanguageService
  ) { }

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
