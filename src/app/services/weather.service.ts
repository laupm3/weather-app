import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherData, ForecastData, CitySuggestion } from '../models/weather.model';

/**
 * Service to interact with the OpenWeatherMap API.
 * Provides methods for searching cities and fetching current/forecast weather data.
 */
@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '185669c3cc254ee20ab41aff03c1f043'; // User will need to replace this if necessary
  private apiUrl = 'https://api.openweathermap.org/data/2.5';
  private geoUrl = 'https://api.openweathermap.org/geo/1.0';

  constructor(private http: HttpClient) { }

  /**
   * Searches for cities matching a query string.
   * @param query - The city name or part of it.
   * @param lang - Target language (default 'en').
   */
  searchCities(query: string, lang: string = 'en'): Observable<CitySuggestion[]> {
    return this.http.get<CitySuggestion[]>(
      `${this.geoUrl}/direct?q=${query}&limit=5&appid=${this.apiKey}&lang=${lang}`
    );
  }

  /**
   * Fetches current weather data for a specific city.
   */
  getWeather(city: string, units: string = 'metric', lang: string = 'en'): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=${units}&lang=${lang}`
    );
  }

  /**
   * Fetches current weather data using geographic coordinates.
   */
  getWeatherByCoords(lat: number, lon: number, units: string = 'metric', lang: string = 'en'): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${this.apiUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=${lang}`
    );
  }

  /**
   * Fetches 5-day forecast data for a specific city.
   */
  getForecast(city: string, units: string = 'metric', lang: string = 'en'): Observable<ForecastData> {
    return this.http.get<ForecastData>(
      `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=${units}&lang=${lang}`
    );
  }

  /**
   * Fetches 5-day forecast data using geographic coordinates.
   */
  getForecastByCoords(lat: number, lon: number, units: string = 'metric', lang: string = 'en'): Observable<ForecastData> {
    return this.http.get<ForecastData>(
      `${this.apiUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=${lang}`
    );
  }
}
