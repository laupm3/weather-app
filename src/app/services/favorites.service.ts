import { Injectable, signal, computed } from '@angular/core';

/**
 * Service to manage the user's favorite weather locations.
 * Uses localStorage for persistence and Angular Signals for reactivity.
 */
@Injectable({
    providedIn: 'root',
})
export class FavoritesService {
    private readonly STORAGE_KEY = 'weather_app_favorites';

    // Internal signal to hold favorites
    private favoritesSignal = signal<string[]>(this.loadFavorites());

    /**
     * Read-only signal exposed to components
     */
    public favorites = computed(() => this.favoritesSignal());

    /**
     * Adds a city to the favorites list.
     * @param city - The name of the city to add.
     */
    addFavorite(city: string): void {
        const fresh = this.loadFavorites();
        if (!fresh.includes(city)) {
            fresh.push(city);
            this.saveFavorites(fresh);
            this.favoritesSignal.set(fresh);
        }
    }

    /**
     * Removes a city from the favorites list.
     * @param city - The name of the city to remove.
     */
    removeFavorite(city: string): void {
        const filtered = this.loadFavorites().filter(f => f !== city);
        this.saveFavorites(filtered);
        this.favoritesSignal.set(filtered);
    }

    /**
     * Refreshes the favorites from storage (useful for multi-tab sync).
     */
    refresh(): void {
        this.favoritesSignal.set(this.loadFavorites());
    }

    /**
     * Checks if a city is in the favorites list.
     * @param city - The name of the city to check.
     */
    isFavorite(city: string): boolean {
        return this.favoritesSignal().includes(city);
    }

    /**
     * Loads the favorites from localStorage.
     */
    private loadFavorites(): string[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    /**
     * Persists the favorites to localStorage.
     */
    private saveFavorites(favorites: string[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    }
}
