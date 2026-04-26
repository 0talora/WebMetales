import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetalsService } from './services/metals-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {

  private metalsService = inject(MetalsService);

  metalData: any;

  metalSeleccionado: string = 'XAU';
  unidad: string = 'g';
  kilates: number = 24;
  cantidad: number = 1;
  ngOnInit() {
    this.loadMetal();
  }

loadMetal() {
  this.metalsService.getMetals().subscribe({
    next: (res) => {
      console.log(res);

      switch (this.metalSeleccionado) {
        case 'XAU':
          this.metalData = res.gold.EUR;
          break;

        case 'XAG':
          this.metalData = res.silver.EUR;
          break;

        case 'XPT':
          this.metalData = res.platinum.EUR;
          break;

        case 'XPD':
          this.metalData = res.palladium.EUR;
          break;
      }
    },
    error: (err) => console.error(err)
  });
}

  onMetalChange() {
    this.loadMetal();
  }

  getTotalPrice(): number {
    if (!this.metalData) return 0;

    let precio = Number(this.metalData.price_per_gram);
    const cantidad = Number(this.cantidad);

    switch (this.unidad) {
      case 'g':
        precio = Number(this.metalData.price_per_gram);
        break;

      case 'oz':
        precio = Number(this.metalData.price_per_troy_ounce);
        break;

      case 'kg':
        precio = Number(this.metalData.price_per_gram) * 1000;
        break;

      case 'lb':
        precio = Number(this.metalData.price_per_gram) * 453.592;
        break;
    }

    if (this.metalSeleccionado === 'XAU') {
      precio = precio * (this.kilates / 24);
    }

    return precio * cantidad;
  }

  protected readonly title = signal('webMetales');
}