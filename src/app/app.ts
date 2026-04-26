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

  selectedMetal: string = 'XAU';
  unit: string = 'gram';
  karat: number = 24;
  quantity: number = 1;
  ngOnInit() {
    this.loadMetal();
  }

  loadMetal() {
    this.metalsService.getMetal(this.selectedMetal).subscribe({
      next: (res) => {
        this.metalData = res.data;
        console.log(res);
      },
      error: (err) => {
        console.error('Error API:', err);
      }
    });
  }

  onMetalChange() {
    this.loadMetal();
  }

  getTotalPrice(): number {
    if (!this.metalData) return 0;

    const pricePerGram = this.metalData.price_per_gram;

    return pricePerGram * this.quantity;
  }

  protected readonly title = signal('webMetales');
}