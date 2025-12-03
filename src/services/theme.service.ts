import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // Signal to track current theme, default to 'dark'
    private _isDarkMode = signal<boolean>(true);

    // Public readonly signal for components to consume
    readonly isDarkMode = this._isDarkMode.asReadonly();

    constructor() {
        // Initialize theme from localStorage or use default (dark)
        this.initializeTheme();

        // Apply theme class whenever isDarkMode changes
        effect(() => {
            this.applyTheme(this._isDarkMode());
        });
    }

    private initializeTheme(): void {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme === 'light') {
            this._isDarkMode.set(false);
        } else {
            // Default to dark mode
            this._isDarkMode.set(true);
            // Save the default preference
            localStorage.setItem('theme', 'dark');
        }
    }

    private applyTheme(isDark: boolean): void {
        const htmlElement = document.documentElement;

        if (isDark) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    }

    toggleTheme(): void {
        const newTheme = !this._isDarkMode();
        this._isDarkMode.set(newTheme);

        // Persist the preference
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    }
}
