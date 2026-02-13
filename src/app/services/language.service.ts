import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translations {
    [key: string]: {
        [lang: string]: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLang = new BehaviorSubject<string>(this.detectLanguage());
    currentLang$ = this.currentLang.asObservable();

    private translations: Translations = {
        'SEARCH_PLACEHOLDER': {
            en: 'Find your city...',
            es: 'Busca tu ciudad...'
        },
        'SEARCH_BUTTON': {
            en: 'Search',
            es: 'Buscar'
        },
        'FEELS_LIKE': {
            en: 'Feels like',
            es: 'Sensación'
        },
        'HUMIDITY': {
            en: 'Humidity',
            es: 'Humedad'
        },
        'WIND_SPEED': {
            en: 'Wind Speed',
            es: 'Viento'
        },
        'FORECAST_TITLE': {
            en: '5-Day Forecast',
            es: 'Pronóstico 5 días'
        },
        'FAVORITES_TITLE': {
            en: 'Your Locations',
            es: 'Tus Ubicaciones'
        },
        'WELCOME_MSG': {
            en: 'Ready to discover the weather?',
            es: '¿Listo para descubrir el clima?'
        },
        'ERROR_MSG': {
            en: 'Weather data unavailable. Please try again.',
            es: 'Clima no disponible. Inténtalo de nuevo.'
        },
        'ANALYZING_MSG': {
            en: 'Analyzing weather data...',
            es: 'Analizando datos del clima...'
        },
        'UNIT_METRIC': {
            en: 'Metric',
            es: 'Métrico'
        },
        'UNIT_IMPERIAL': {
            en: 'Imperial',
            es: 'Imperial'
        },
        'VISIBILITY': {
            en: 'Visibility',
            es: 'Visibilidad'
        },
        'APP_TITLE': {
            en: 'Atmos',
            es: 'Atmos'
        },
        'DATE_FORMAT': {
            en: 'EEEE, MMM d',
            es: "EEEE, d 'de' MMM"
        },
        'QUICK_ACCESS': {
            en: 'Quick Access',
            es: 'Acceso Rápido'
        },
        'REMOVE': {
            en: 'Remove',
            es: 'Eliminar'
        },
        'TOGGLE_FAVORITE': {
            en: 'Toggle favorite',
            es: 'Alternar favorito'
        },
        'CHART_TITLE': {
            en: '24h Temperature Evolution',
            es: 'Evolución Temp. 24h'
        },
        'CHART_LABEL': {
            en: 'Temperature',
            es: 'Temperatura'
        }
    };

    private detectLanguage(): string {
        const saved = localStorage.getItem('weather-lang');
        if (saved) return saved;

        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'es' ? 'es' : 'en';
    }

    setLanguage(lang: string) {
        this.currentLang.next(lang);
        localStorage.setItem('weather-lang', lang);
    }

    get(key: string): string {
        const lang = this.currentLang.value;
        return this.translations[key]?.[lang] || key;
    }

    getCurrentLang(): string {
        return this.currentLang.value;
    }
}
