import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AnnualReport } from './annual-report';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-anual-report',
  imports: [FormsModule, CommonModule, DialogModule, TableModule],
  templateUrl: './anual-report.html',
  styleUrl: './anual-report.css',
})
export class AnualReport {
  // Pagination + Search
  pageNo: number = 1;
  pageSize: number = 10;
  keyword: string = '';
  selectedYear: string = '';
  totalRecords: number = 0;

  // Data
  annual_reports: any[] = [];

  // Year Options
  currentYear = new Date().getFullYear();
  yearOptions: number[] = [];

  constructor(private annualReportService: AnnualReport) {}

  ngOnInit(): void {
    this.generateYearOptions();
    this.getAllAnnualReports();
  }

  onPageChange(event: any): void {
    this.pageNo = event.first / event.rows;
    this.pageSize = event.rows;
    this.getAllAnnualReports();
  }

  generateYearOptions(): void {
    const range = 5;
    for (let i = 0; i < range; i++) {
      this.yearOptions.push(this.currentYear - i);
    }
  }

  onKeywordChange(): void {
    this.pageNo = 1;
    this.getAllAnnualReports();
  }

  onYearChange(): void {
    this.pageNo = 1;
    this.getAllAnnualReports();
  }

  getAllAnnualReports(): void {
    this.annualReportService
      .getAllReports(
        this.pageNo,
        this.pageSize,
        this.keyword,
        this.selectedYear
      )
      .subscribe({
        next: (res) => {
          console.log(res);

          this.annual_reports = res.data;
          this.totalRecords = res.total || res.data.length;
        },
        error: (err) => {
          console.error('Failed to fetch annual reports:', err);
          Swal.fire('Error', 'Could not load reports.', 'error');
        },
      });
  }

  isUploading: boolean = false;

  // Upload modal state
  showUploadModal: boolean = false;

  // Upload form data
  uploadForm = {
    title: '',
    year: '',
    file: null as File | null,
  };

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadForm.file = input.files[0];
    }
  }

  resetUploadForm(): void {
    this.uploadForm = {
      title: '',
      year: '',
      file: null,
    };
  }

  uploadReport(event: Event): void {
    event.preventDefault();

    if (
      !this.uploadForm.title ||
      !this.uploadForm.year ||
      !this.uploadForm.file
    ) {
      Swal.fire('Error', 'Please fill in all fields.', 'error');
      return;
    }

    this.isUploading = true; // Start loading

    const userId = sessionStorage.getItem('user_id');
    const formData = new FormData();
    formData.append('title', this.uploadForm.title);
    formData.append('year', this.uploadForm.year);
    formData.append('pdf', this.uploadForm.file!);
    formData.append('uploaded_by', userId as string);

    this.annualReportService.uploadReport(formData).subscribe({
      next: () => {
        Swal.fire('Success', 'Annual report uploaded.', 'success');
        this.showUploadModal = false;
        this.resetUploadForm();
        this.getAllAnnualReports();
        this.isUploading = false; // Stop loading
      },
      error: () => {
        Swal.fire('Error', 'Upload failed.', 'error');
        this.isUploading = false; // Stop loading on error
      },
    });
  }
}
