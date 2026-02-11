import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { WeatherService } from '../../services/weather.service';
import { LanguageService } from '../../services/language.service';
import { CitySuggestion } from '../../models/weather.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnInit, OnDestroy {
  @Output() citySearch = new EventEmitter<string>();
  city: string = '';
  suggestions: CitySuggestion[] = [];
  showSuggestions: boolean = false;
  selectedIndex: number = -1;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private langSubscription?: Subscription;

  constructor(
    private weatherService: WeatherService,
    public langService: LanguageService,
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.cdr.detectChanges();
    });

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 3) {
          this.suggestions = [];
          return [];
        }
        return this.weatherService.searchCities(query, this.langService.getCurrentLang()).pipe(
          catchError(() => [])
        );
      })
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
      this.showSuggestions = suggestions.length > 0;
      this.selectedIndex = -1;
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
  }

  onInput(event: any): void {
    this.searchSubject.next(this.city);
  }

  onSearch(): void {
    if (this.city.trim()) {
      this.citySearch.emit(this.city.trim());
      this.clearSearch();
    }
  }

  selectSuggestion(suggestion: CitySuggestion): void {
    const cityName = `${suggestion.name}${suggestion.state ? ', ' + suggestion.state : ''}, ${suggestion.country}`;
    this.citySearch.emit(cityName);
    this.clearSearch();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!this.showSuggestions) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex !== -1) {
      this.selectSuggestion(this.suggestions[this.selectedIndex]);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  private clearSearch(): void {
    this.city = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedIndex = -1;
  }

  onBlur(): void {
    // Delay to allow click event on suggestion list to fire
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}

