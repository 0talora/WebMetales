import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent)
  .then(() => {
    document.querySelector('[data-app-fallback]')?.remove();
    delete document.documentElement.dataset['appStartup'];
  })
  .catch(error => {
    document.documentElement.dataset['appStartup'] = 'failed';
    console.error(error);
  });
