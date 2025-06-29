import { Component, OnInit } from '@angular/core';
import { CampusService } from './campus-service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-campuses',
  imports: [
    TableModule,
    CommonModule,
    FormsModule,
    DialogModule,
    ReactiveFormsModule,
    DropdownModule,
  ],
  templateUrl: './campuses.html',
  styleUrl: './campuses.css',
})
export class Campuses implements OnInit {
  campuses: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  // Pagination + Search
  pageNo: number = 0;
  pageSize: number = 10;
  keyword: string = '';
  totalRecords: number = 0;

  // Modal + Form
  showAddCampusDialog: boolean = false;
  campusForm!: FormGroup;

  // Edit state
  editMode: boolean = false;
  selectedCampusId: number | null = null;

  constructor(private campusService: CampusService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.fetchCampuses();
    this.campusForm = this.fb.group({
      campus_name: ['', [Validators.required]],
      is_extension: [false, [Validators.required]],
      status: ['active', [Validators.required]],
    });
  }

  fetchCampuses(): void {
    this.loading = true;
    this.campusService
      .getCampuses({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        keyword: this.keyword,
      })
      .subscribe({
        next: (response: any) => {
          this.campuses = response.data;
          this.totalRecords = response.total;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load campuses.';
          this.loading = false;
        },
      });
  }

  onKeywordChange(): void {
    this.pageNo = 0;
    this.fetchCampuses();
  }

  onPageChange(event: any): void {
    this.pageNo = event.first / event.rows; // first is 0, 20, 40...
    this.pageSize = event.rows;

    this.fetchCampuses();
  }

  handleAddCampusDialog(): void {
    this.resetFormState();
    this.showAddCampusDialog = true;
  }

  onEditCampus(campus: any): void {
    this.editMode = true;
    this.selectedCampusId = campus.campus_id;
    this.showAddCampusDialog = true;

    this.campusService.getCampusById(campus.campus_id).subscribe({
      next: (response: any) => {
        const data = response.data;
        this.campusForm.patchValue({
          campus_name: data.campus_name,
          is_extension: data.is_extension,
          status: data.status,
        });
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load campus details.';
      },
    });
  }

  submitCampus(): void {
    if (this.campusForm.valid) {
      const campusData = this.campusForm.value;

      if (this.editMode && this.selectedCampusId !== null) {
        this.campusService
          .updateCampus(this.selectedCampusId, campusData)
          .subscribe({
            next: () => {
              this.fetchCampuses();
              this.resetFormState();
            },
            error: (err) => {
              this.errorMessage = err.message;
            },
          });
      } else {
        this.campusService.createCampus(campusData).subscribe({
          next: () => {
            this.fetchCampuses();
            this.resetFormState();
          },
          error: (err) => {
            this.errorMessage = err.message;
          },
        });
      }
    }
  }

  resetFormState(): void {
    this.campusForm.reset({
      campus_name: '',
      is_extension: false,
      status: 'active',
    });
    this.editMode = false;
    this.selectedCampusId = null;
    this.showAddCampusDialog = false;
  }
}
