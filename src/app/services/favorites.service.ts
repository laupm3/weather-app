import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FavoritesService {
    private readonly STORAGE_KEY = 'weather_app_favorites';
    private favoritesSubject = new BehaviorSubject<string[]>(this.loadFavorites());

    getFavorites(): Observable<string[]> {
        return this.favoritesSubject.asObservable();
    }

    addFavorite(city: string): void {
        const fresh = this.loadFavorites();
        if (!fresh.includes(city)) {
            fresh.push(city);
            this.saveFavorites(fresh);
            this.favoritesSubject.next(fresh);
        }
    }

    removeFavorite(city: string): void {
        const filtered = this.loadFavorites().filter(f => f !== city);
        this.saveFavorites(filtered);
        this.favoritesSubject.next(filtered);
    }

    refresh(): void {
        this.favoritesSubject.next(this.loadFavorites());
    }

    isFavorite(city: string): boolean {
        return this.loadFavorites().includes(city);
    }

    private loadFavorites(): string[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveFavorites(favorites: string[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
    }
}
