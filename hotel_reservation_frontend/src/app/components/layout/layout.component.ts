import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

interface SvgDecoration {
  src: string;
  top: string;
  left: string;
  size: string;
  animationClass?: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [CommonModule, NgClass, HeaderComponent]
})
export class LayoutComponent implements OnInit {
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
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minDistance = 90; // Minimum distance between icons in px

    // Define the exclusion zone (center 1000x900px)
    const exclusionZone = {
      left: (screenWidth / 2) - 500,
      top: (screenHeight / 2) - 300,
      right: (screenWidth / 2) + 500,
      bottom: (screenHeight / 2) + 450
    };

    const decorations: SvgDecoration[] = [];

    for (let i = 0; i < iconsToShow; i++) {
      let placed = false;
      let attempts = 0;
      let size = 80 + Math.random() * 100;
      let maxTop = screenHeight - size;
      let maxLeft = screenWidth - size;
      let top = 0;
      let left = 0;

      while (!placed && attempts < 100) {
        size = 80 + Math.random() * 100;
        maxTop = screenHeight - size;
        maxLeft = screenWidth - size;
        top = Math.random() * maxTop;
        left = Math.random() * maxLeft;

        // Check for overlap or being too close to existing icons
        const tooClose = decorations.some(deco => {
          const decoTop = parseFloat(deco.top);
          const decoLeft = parseFloat(deco.left);
          const decoSize = parseFloat(deco.size);

          const center1 = { x: left + size / 2, y: top + size / 2 };
          const center2 = { x: decoLeft + decoSize / 2, y: decoTop + decoSize / 2 };
          const distance = Math.hypot(center1.x - center2.x, center1.y - center2.y);

          // Minimum distance is half the sum of sizes plus buffer
          return distance < ((size + decoSize) / 2 + minDistance);
        });

        // Check if icon overlaps with the exclusion zone
        const overlapsExclusionZone =
          left + size > exclusionZone.left &&
          left < exclusionZone.right &&
          top + size > exclusionZone.top &&
          top < exclusionZone.bottom;

        if (!tooClose && !overlapsExclusionZone) {
          placed = true;
        }
        attempts++;
      }

      decorations.push({
        src: `assets/${this.svgFiles[i % this.svgFiles.length]}`,
        top: `${top}px`,
        left: `${left}px`,
        size: `${size}px`,
        animationClass: ''
      });
    }

    this.svgDecorations = decorations;
  }

  animateRandomSvgs() {
    // Remove all animation classes
    this.svgDecorations.forEach(deco => deco.animationClass = '');

    // // Pick 3 unique random indices
    // const indices = new Set<number>();
    // while (indices.size < 3 && indices.size < this.svgDecorations.length) {
    //   indices.add(Math.floor(Math.random() * this.svgDecorations.length));
    // }

    // // Assign a random animation class to each selected SVG
    // Array.from(indices).forEach(idx => {
    //   const randomClass = this.animationClasses[Math.floor(Math.random() * this.animationClasses.length)];
    //   this.svgDecorations[idx].animationClass = randomClass;
    // });

    // // Force Angular to update the view
    // this.svgDecorations = [...this.svgDecorations];
  }
}
