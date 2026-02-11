import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherData, ForecastData, CitySuggestion } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '185669c3cc254ee20ab41aff03c1f043'; // User will need to replace this
  private apiUrl = 'https://api.openweathermap.org/data/2.5';
  private geoUrl = 'https://api.openweathermap.org/geo/1.0';

  constructor(private http: HttpClient) { }

  searchCities(query: string): Observable<CitySuggestion[]> {
    return this.http.get<CitySuggestion[]>(
      `${this.geoUrl}/direct?q=${query}&limit=5&appid=${this.apiKey}`
    );
  }

  getWeather(city: string, units: string = 'metric'): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=${units}`
    );
  }

  getWeatherByCoords(lat: number, lon: number, units: string = 'metric'): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${this.apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`
    );
  }

  getForecast(city: string, units: string = 'metric'): Observable<ForecastData> {
    return this.http.get<ForecastData>(
      `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=${units}`
    );
  }

  getForecastByCoords(lat: number, lon: number, units: string = 'metric'): Observable<ForecastData> {
    return this.http.get<ForecastData>(
      `${this.apiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`
    );
  }
}
