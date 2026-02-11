import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherData, ForecastData } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '185669c3cc254ee20ab41aff03c1f043'; // User will need to replace this
  private apiUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`
    );
  }

  getForecast(city: string): Observable<ForecastData> {
    return this.http.get<ForecastData>(
      `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`
    );
  }
}
