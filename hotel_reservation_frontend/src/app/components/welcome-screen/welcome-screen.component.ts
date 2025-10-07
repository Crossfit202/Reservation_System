import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SvgDecoration {
  src: string;
  top: string;
  left: string;
  size: string;
  animationClass?: string;
}

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  templateUrl: './welcome-screen.component.html',
  styleUrls: ['./welcome-screen.component.css'],
  imports: [RouterModule, CommonModule]
})
export class WelcomeScreenComponent {
  menuOpen = false;
  userEmail: string | null = null;

  constructor(private router: Router) {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userEmail = payload.sub;
      } catch (e) {
        this.userEmail = null;
      }
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  signOut() {
    localStorage.removeItem('jwt');
    this.userEmail = null;
    this.router.navigate(['/login']);
  }

  svgFiles = [
    'air-conditioner-svgrepo-com.svg',
    'bellhop-svgrepo-com.svg',
    'breakfast-hot-drink-coffee-svgrepo-com.svg',
    'luggage-svgrepo-com.svg',
    'pillow-svgrepo-com.svg',
    'stars-1-svgrepo-com.svg',
    'swimming-svgrepo-com.svg',
    'tv-monitor-svgrepo-com.svg'
  ];

  svgDecorations: SvgDecoration[] = [];

  animationClasses = [
    'fade-animation',
    'spin-animation',
    'float-animation',
    'fade-animation float-animation',
    'spin-animation fade-animation'
  ];

  ngOnInit() {
    this.generateSvgDecorations();
    this.animateRandomSvgs();
    setInterval(() => this.animateRandomSvgs(), 6000);
  }

  generateSvgDecorations() {
    const iconsToShow = 20;
    const gridRows = 5;
    const gridColsPerSide = Math.ceil(iconsToShow / (2 * gridRows));
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const contentWidth = 1200;
    const centerStart = (screenWidth - contentWidth) / 2;
    const centerEnd = centerStart + contentWidth;
    const cellHeight = screenHeight / gridRows;
    const leftCellWidth = centerStart / gridColsPerSide;
    const rightCellWidth = (screenWidth - centerEnd) / gridColsPerSide;

    const slots: { top: number, left: number }[] = [];

    // Left side grid
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColsPerSide; col++) {
        const top = row * cellHeight + Math.random() * (cellHeight - 100);
        const left = col * leftCellWidth + Math.random() * (leftCellWidth - 100);
        slots.push({ top, left });
      }
    }
    // Right side grid
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridColsPerSide; col++) {
        const top = row * cellHeight + Math.random() * (cellHeight - 100);
        const left = centerEnd + col * rightCellWidth + Math.random() * (rightCellWidth - 100);
        slots.push({ top, left });
      }
    }

    // Shuffle and pick only as many as needed
    const shuffle = <T>(arr: T[]) => arr.sort(() => Math.random() - 0.5);
    const allSlots = shuffle(slots).slice(0, iconsToShow);

    this.svgDecorations = allSlots.map((slot, i) => {
      const size = 80 + Math.random() * 100;
      return {
        src: `assets/${this.svgFiles[i % this.svgFiles.length]}`,
        top: `${slot.top}px`,
        left: `${slot.left}px`,
        size: `${size}px`,
        animationClass: ''
      };
    });
  }

  animateRandomSvgs() {
    // Remove all animation classes
    this.svgDecorations.forEach(deco => deco.animationClass = '');

    // Pick 3 unique random indices
    const indices = new Set<number>();
    while (indices.size < 3 && indices.size < this.svgDecorations.length) {
      indices.add(Math.floor(Math.random() * this.svgDecorations.length));
    }

    // Assign a random animation class to each selected SVG
    Array.from(indices).forEach(idx => {
      const randomClass = this.animationClasses[Math.floor(Math.random() * this.animationClasses.length)];
      this.svgDecorations[idx].animationClass = randomClass;
    });

    // Force Angular to update the view
    this.svgDecorations = [...this.svgDecorations];
  }
}
