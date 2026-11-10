import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { copy } from './copy';

export const languages = { es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch' };
export type Language = keyof typeof languages;
type Theme = 'system' | 'light' | 'dark';
type LanguageChoice = Language | 'system';

function isLanguage(value: string): value is Language {
  return Object.hasOwn(languages, value);
}

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function save(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ }
}

function browserLanguage(): Language {
  return (navigator.languages.length ? navigator.languages : [navigator.language])
    .map(locale => locale.toLowerCase().split('-')[0]).find(isLanguage) ?? 'es';
}

@Injectable({ providedIn: 'root' })
export class Preferences {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly detected = signal(browserLanguage());
  private readonly savedLanguage = read('web-metales-language');
  private readonly savedTheme = read('web-metales-theme');
  readonly languageChoice = signal<LanguageChoice>(
    this.savedLanguage && isLanguage(this.savedLanguage) ? this.savedLanguage : 'system'
  );
  readonly theme = signal<Theme>(
    this.savedTheme === 'light' || this.savedTheme === 'dark' ? this.savedTheme : 'system'
  );
  readonly language = computed(() => {
    const choice = this.languageChoice();
    return choice === 'system' ? this.detected() : choice;
  });
  readonly text = computed(() => copy[this.language()]);

  constructor() {
    const onLanguageChange = () => this.detected.set(browserLanguage());
    window.addEventListener('languagechange', onLanguageChange);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('languagechange', onLanguageChange));
    effect(() => {
      const root = this.document.documentElement;
      const theme = this.theme();
      if (theme === 'system') root.removeAttribute('data-theme');
      else root.dataset['theme'] = theme;
      root.lang = this.language();
      const { title, description } = this.text();
      this.document.title = title + ' | otalora';
      this.meta.updateTag({ name: 'description', content: description });
    });
  }

  setLanguage(value: string): void {
    if (value !== 'system' && !isLanguage(value)) return;
    this.languageChoice.set(value);
    save('web-metales-language', value);
  }

  setTheme(value: string): void {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    this.theme.set(value);
    save('web-metales-theme', value);
  }
}
