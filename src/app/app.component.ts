import { Component } from '@angular/core';
import * as d3 from 'd3';

interface Trip {
  start: string;
  end: string;
  level: number;
  abbrStart: string;
  abbrEnd: string;
  isNotContinous: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  trips: Trip[] = [];
  newStart = '';
  newEnd = '';

  get svgWidth(): number {
    return this.trips.length * 150 + 100;
  }


  getX(index: number): number {
    return 100 + index * 150;
  }

  getY(level: number): number {
    return [80, 40][level - 1] || 80;
  }

  hoveredTrip: { abbrStart: string, abbrEnd: string } | null = null;

  get routePath(): string {
    if (this.trips.length === 0) return '';

    let points = this.trips.map((trip, i) => [this.getX(i), this.getY(trip.level)]);
    let line = d3.line().curve(d3.curveMonotoneX);
    return line(points as [number, number][]) || '';
  }

  get segmentPaths(): string[] {
    let gap = 13;
    let paths: string[] = [];

    for (let i = 0; i < this.trips.length - 1; i++) {
      let x1 = this.getX(i);
      let y1 = this.getY(this.trips[i].level);
      let x2 = this.getX(i + 1);
      let y2 = this.getY(this.trips[i + 1].level);

      let dx = x2 - x1;
      let dy = y2 - y1;
      let len = Math.sqrt(dx * dx + dy * dy);

      let offsetX = (dx / len) * gap;
      let offsetY = (dy / len) * gap;

      let startX = x1 + offsetX;
      let startY = y1 + offsetY;
      let endX = x2 - offsetX;
      let endY = y2 - offsetY;

      if (y1 === y2) {
        paths.push(`M${startX},${startY} L${endX},${endY}`);
      } else {
        let curvature = 10;
        let control1X = startX + (endX - startX) / 40;
        let control1Y = startY + (y2 > y1 ? -curvature : curvature);
        let control2X = startX + (4 * (endX - startX)) / 4;
        let control2Y = endY + (y2 > y1 ? curvature : -curvature);

        paths.push(`M${startX},${startY} C${control1X},${control1Y} ${control2X},${control2Y} ${endX},${endY}`);

      }
    }

    return paths;
  }

  addTrip() {
    if (this.newStart && this.newEnd) {
      let abbrStart = this.newStart;
      let abbrEnd = this.newEnd
      let start = this.newStart.substring(0, 3).toUpperCase();
      let end = this.newEnd.substring(0, 3).toUpperCase();
      let level = this.calculateLevel(start, end);
      let isNotContinous = false;
      if (level === 3) {
        level = 1;
        isNotContinous = true;
      }

      this.trips.push({ start, end, abbrStart, abbrEnd, level, isNotContinous });
      this.newStart = '';
      this.newEnd = '';
    }
  }

  getCircleColor(index: number): string {
    let colors = ['#5C6BC0', '#2196F3', '#FFB74D', '#90A4AE', '#7E57C2'];
    return colors[index % colors.length];
  }

  calculateLevel(start: string, end: string): number {
    if (this.trips.length === 0) return 1;

    let lastTrip = this.trips[this.trips.length - 1];

    if (lastTrip.start === start && lastTrip.end === end) {
      lastTrip.level = 2;
      return 2;
    }

    if (lastTrip.end === start) {return 1;}
    return 3;
  }

  loadSample() {
    this.trips = [
      { start: 'BAN', end: 'CHE', abbrStart: 'Bangalore', abbrEnd: 'Chennai', level: 1, isNotContinous: false },
      { start: 'CHE', end: 'HYD', abbrStart: 'Chennai', abbrEnd: 'Hyderabad', level: 1, isNotContinous: false },
      { start: 'BAN', end: 'HYD', abbrStart: 'Bangalore', abbrEnd: 'Hyderabad', level: 1, isNotContinous: true },
      { start: 'HYB', end: 'DEL', abbrStart: 'Hyderabad', abbrEnd: 'Delhi', level: 2, isNotContinous: false },
      { start: 'HYB', end: 'DEL', abbrStart: 'Hyderabad', abbrEnd: 'Delhi', level: 2, isNotContinous: false },
      { start: 'DEL', end: 'BLR', abbrStart: 'Delhi', abbrEnd: 'Bangalore', level: 1, isNotContinous: false },
      { start: 'CHE', end: 'HYD', abbrStart: 'Chennai', abbrEnd: 'Hyderabad', level: 1, isNotContinous: true },
    ];
  }

  clearTripData() {
    this.trips = [];
  }
}
