export interface WeatherData {
    main: {
        temp: number;
        feels_like: number;
        humidity: number;
        pressure: number;
    };
    weather: [
        {
            description: string;
            icon: string;
            main: string;
        }
    ];
    wind: {
        speed: number;
    };
    visibility: number;
    name: string;
    dt: number;
}

export interface ForecastData {
    list: Array<{
        dt: number;
        main: {
            temp: number;
        };
        weather: Array<{
            description: string;
            icon: string;
        }>;
        dt_txt: string;
    }>;
    city: {
        name: string;
    };
}

export interface CitySuggestion {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

