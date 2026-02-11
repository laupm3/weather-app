import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ForecastData } from '../../models/weather.model';

Chart.register(...registerables);

@Component({
    selector: 'app-hourly-chart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hourly-chart.html',
    styleUrl: './hourly-chart.css'
})
export class HourlyChart implements OnChanges, AfterViewInit {
    @Input() forecastData!: ForecastData;
    @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

    private chart: Chart | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['forecastData'] && this.chart) {
            this.updateChart();
        }
    }

    ngAfterViewInit(): void {
        this.createChart();
    }

    private createChart(): void {
        const ctx = this.chartCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        // Extraemos los datos (próximas 8 lecturas = 24 horas aprox)
        const next24h = this.forecastData.list.slice(0, 8);
        const labels = next24h.map(item => {
            const date = new Date(item.dt * 1000);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        const temps = next24h.map(item => item.main.temp);

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature',
                    data: temps,
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: 'rgba(255,255,255,0.5)',
                    pointBorderWidth: 5,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 14 },
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${context.parsed.y.toFixed(1)}°`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 11 } }
                    },
                    y: {
                        display: false,
                        grid: { display: false }
                    }
                }
            }
        });
    }

    private updateChart(): void {
        if (!this.chart) return;

        const next24h = this.forecastData.list.slice(0, 8);
        this.chart.data.labels = next24h.map(item => {
            const date = new Date(item.dt * 1000);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        });
        this.chart.data.datasets[0].data = next24h.map(item => item.main.temp);
        this.chart.update();
    }
}
