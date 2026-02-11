import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  @Output() citySearch = new EventEmitter<string>();
  city: string = '';

  onSearch(): void {
    if (this.city.trim()) {
      this.citySearch.emit(this.city.trim());
      this.city = '';
    }
  }
}
