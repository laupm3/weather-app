import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
    let service: LanguageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LanguageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should default to English or Spanish based on detection', () => {
        const lang = service.getCurrentLang();
        expect(['en', 'es']).toContain(lang);
    });

    it('should return correct translation for a key', () => {
        service.setLanguage('es');
        expect(service.get('SEARCH_BUTTON')).toBe('Buscar');

        service.setLanguage('en');
        expect(service.get('SEARCH_BUTTON')).toBe('Search');
    });

    it('should toggle language correctly', () => {
        service.setLanguage('en');
        service.toggleLang();
        expect(service.getCurrentLang()).toBe('es');

        service.toggleLang();
        expect(service.getCurrentLang()).toBe('en');
    });

    it('should handle missing keys gracefully', () => {
        expect(service.get('NON_EXISTENT_KEY')).toBe('NON_EXISTENT_KEY');
    });
});
