import { Injectable, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export interface Translations {
    [key: string]: {
        [lang: string]: string;
    };
}

/**
 * Service to manage application wide translations and language settings.
 * Uses Angular Signals for efficient, reactive UI updates.
 */
@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    // Internal signal for language state
    private currentLang = signal<string>(this.detectLanguage());

    /**
     * Observable stream of language changes for RxJS-heavy components.
     */
    currentLang$ = toObservable(this.currentLang);

    private translations: Translations = {
        'SEARCH_PLACEHOLDER': { en: 'Find your city...', es: 'Busca tu ciudad...' },
        'SEARCH_BUTTON': { en: 'Search', es: 'Buscar' },
        'FEELS_LIKE': { en: 'Feels like', es: 'Sensación' },
        'HUMIDITY': { en: 'Humidity', es: 'Humedad' },
        'WIND_SPEED': { en: 'Wind Speed', es: 'Viento' },
        'FORECAST_TITLE': { en: '5-Day Forecast', es: 'Pronóstico 5 días' },
        'FAVORITES_TITLE': { en: 'Your Locations', es: 'Tus Ubicaciones' },
        'WELCOME_MSG': { en: 'Ready to discover the weather?', es: '¿Listo para descubrir el clima?' },
        'ERROR_MSG': { en: 'Weather data unavailable. Please try again.', es: 'Clima no disponible. Inténtalo de nuevo.' },
        'ANALYZING_MSG': { en: 'Analyzing weather data...', es: 'Analizando datos del clima...' },
        'UNIT_METRIC': { en: 'Metric', es: 'Métrico' },
        'UNIT_IMPERIAL': { en: 'Imperial', es: 'Imperial' },
        'VISIBILITY': { en: 'Visibility', es: 'Visibilidad' },
        'APP_TITLE': { en: 'Atmos', es: 'Atmos' },
        'DATE_FORMAT': { en: 'EEEE, MMM d', es: "EEEE, d 'de' MMM" },
        'QUICK_ACCESS': { en: 'Quick Access', es: 'Acceso Rápido' },
        'REMOVE': { en: 'Remove', es: 'Eliminar' },
        'TOGGLE_FAVORITE': { en: 'Toggle favorite', es: 'Alternar favorito' },
        'CHART_TITLE': { en: '24h Temperature Evolution', es: 'Evolución Temp. 24h' },
        'CHART_LABEL': { en: 'Temperature', es: 'Temperatura' },
        'SUN_TIME': { en: 'Sun Cycle', es: 'Ciclo Solar' }
    };

    /**
     * Detects initial language from localStorage or browser settings.
     */
    private detectLanguage(): string {
        const saved = localStorage.getItem('weather-lang');
        if (saved) return saved;

        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'es' ? 'es' : 'en';
    }

    /**
     * Switches the application language.
     * @param lang - 'en' or 'es'
     */
    setLanguage(lang: string) {
        if (this.currentLang() !== lang) {
            this.currentLang.set(lang);
            localStorage.setItem('weather-lang', lang);
        }
    }

    /**
     * Toggles between available languages.
     */
    toggleLang() {
        const newLang = this.currentLang() === 'en' ? 'es' : 'en';
        this.setLanguage(newLang);
    }

    /**
     * Retrieves a translated string for a given key.
     * @param key - The translation key.
     * @returns The translated string in the current language.
     */
    get(key: string): string {
        return this.translations[key]?.[this.currentLang()] || key;
    }

    /**
     * Gets the current language code.
     */
    getCurrentLang(): string {
        return this.currentLang();
    }
}
