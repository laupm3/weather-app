import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { WeatherData } from '../../models/weather.model';

@Component({
  selector: 'app-weather-card',
  imports: [CommonModule],
  templateUrl: './weather-card.html',
  styleUrl: './weather-card.css',
  providers: [DecimalPipe]
})
export class WeatherCard {
  @Input() weatherData?: WeatherData;
}
