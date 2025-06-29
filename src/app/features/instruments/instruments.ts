import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Instrument } from './instrument';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-instruments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule],
  templateUrl: './instruments.html',
  styleUrl: './instruments.css',
})
export class Instruments implements OnInit {
  instruments: any[] = [];

  // Pagination + Search
  pageNo: number = 0;
  pageSize: number = 10;
  keyword: string = '';
  totalRecords: number = 0;

  constructor(private instrumentService: Instrument) {}

  ngOnInit(): void {
    this.fetchInstruments();
  }

  fetchInstruments(): void {
    this.instrumentService
      .getInstruments({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        keyword: this.keyword,
      })
      .subscribe({
        next: (response: any) => {
          this.instruments = response.data;
          this.totalRecords = response.total; // ← used for paginator
        },
        error: (err) => {
          console.error('Failed to fetch instruments:', err);
        },
      });
  }

  onKeywordChange(): void {
    this.pageNo = 1;
    this.fetchInstruments();
  }

  onPageChange(event: any): void {
    this.pageNo = event.first / event.rows;
    this.pageSize = event.rows;
    this.fetchInstruments();
  }
}
