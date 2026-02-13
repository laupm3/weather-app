import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
    let service: WeatherService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WeatherService]
        });
        service = TestBed.inject(WeatherService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch weather data for a city', () => {
        const mockWeather = { name: 'London', main: { temp: 20 } };

        service.getWeather('London').subscribe(data => {
            expect(data).toEqual(mockWeather as any);
        });

        const req = httpMock.expectOne(request =>
            request.urlWithParams.includes('/weather') && request.urlWithParams.includes('q=London')
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockWeather);
    });

    it('should fetch forecast data for a city', () => {
        const mockForecast = { list: [] };

        service.getForecast('London').subscribe(data => {
            expect(data).toEqual(mockForecast as any);
        });

        const req = httpMock.expectOne(request =>
            request.urlWithParams.includes('/forecast') && request.urlWithParams.includes('q=London')
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockForecast);
    });
});
