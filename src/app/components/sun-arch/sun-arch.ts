import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../models/weather.model';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-sun-arch',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sun-arch.html',
    styleUrl: './sun-arch.css'
})
export class SunArch implements OnInit, OnChanges {
    @Input() weatherData?: WeatherData;
    @Input() loading: boolean = false;

    sunProgress: number = 0; // 0 to 1
    isDaylight: boolean = false;

    constructor(public langService: LanguageService) { }

    ngOnInit(): void {
        this.calculateSunPosition();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['weatherData']) {
            this.calculateSunPosition();
        }
    }

    private calculateSunPosition(): void {
        if (!this.weatherData) return;

        const now = Math.floor(Date.now() / 1000);
        const sunrise = this.weatherData.sys.sunrise;
        const sunset = this.weatherData.sys.sunset;

        if (now >= sunrise && now <= sunset) {
            this.isDaylight = true;
            const totalDaylight = sunset - sunrise;
            const elapsed = now - sunrise;
            this.sunProgress = elapsed / totalDaylight;
        } else {
            this.isDaylight = false;
            this.sunProgress = 0;
        }
    }

    getTranslateX(): number {
        // Convierte el progreso (0-1) en una posición X en el arco (coordenadas SVG)
        // El arco va de 0 a 100 en X, pero es una semicircunferencia
        // x = r * cos(theta), y = r * sin(theta)
        return 50 - 45 * Math.cos(this.sunProgress * Math.PI);
    }

    getTranslateY(): number {
        return 50 - 45 * Math.sin(this.sunProgress * Math.PI);
    }

    formatTime(unix: number): string {
        return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
