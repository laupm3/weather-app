import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-weather-icon',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './weather-icon.html',
    styleUrl: './weather-icon.css'
})
export class WeatherIcon {
    @Input() iconCode: string = '01d';
    @Input() size: number = 80;

    getIconType(): string {
        const code = this.iconCode.substring(0, 2);
        switch (code) {
            case '01': return 'clear';
            case '02':
            case '03':
            case '04': return 'clouds';
            case '09':
            case '10': return 'rain';
            case '11': return 'thunderstorm';
            case '13': return 'snow';
            case '50': return 'mist';
            default: return 'clear';
        }
    }

    get isDay(): boolean {
        return this.iconCode.endsWith('d');
    }
}
