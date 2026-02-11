import { Component } from '@angular/core';
import { WeatherDashboard } from './components/weather-dashboard/weather-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeatherDashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  title = 'weather-app';
}
