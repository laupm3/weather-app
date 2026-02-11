import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastData } from '../../models/weather.model';

@Component({
  selector: 'app-forecast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast.html',
  styleUrl: './forecast.css',
})
export class Forecast implements OnChanges {
  @Input() forecastData?: ForecastData;
  dailyForecasts: any[] = [];

  ngOnChanges(): void {
    if (this.forecastData) {
      this.processForecastData();
    }
  }

  private processForecastData(): void {
    if (!this.forecastData) return;

    // OpenWeatherMap returns 3-hour intervals. Filter for one per day (e.g., around noon).
    const daily: any[] = [];
    const seenDates = new Set();

    for (const item of this.forecastData.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seenDates.has(date) && item.dt_txt.includes('12:00:00')) {
        daily.push(item);
        seenDates.add(date);
      }
    }

    // Fallback if 12:00 isn't available for some reason
    if (daily.length < 5) {
      for (const item of this.forecastData.list) {
        const date = item.dt_txt.split(' ')[0];
        if (!seenDates.has(date)) {
          daily.push(item);
          seenDates.add(date);
        }
        if (daily.length === 5) break;
      }
    }

    this.dailyForecasts = daily;
  }
}
