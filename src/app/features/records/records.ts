import { Component } from '@angular/core';
import { Sdgs } from '../../../shared/services/sdgs/sdgs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordService } from './record-service';
import formulaConverter from 'excel-formula';
import Swal from 'sweetalert2';
import { UserService } from '../users/user-service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    ButtonModule,
  ],
  templateUrl: './records.html',
  styleUrl: './records.css',
})
export class Records {
  sdgsList: any[] = [];
  selectedSdg: number | null = null;
  instrument: any = { sections: [] };
  currentTotal = 0;
  sdoUsers: any[] = [];
  fieldValues: { sub_id: string; field_value: string }[] = [];
  contentFormulas: { [contentNo: string]: string } = {};
  recordId: number | null = null;
  yearList: number[] = [];
  selectedYear: number | null = null;
  selectedSdoUser: number | null = null;
  currentStatus: string = ''; // or 'pending', 'approved', etc.

  constructor(
    private sdgsService: Sdgs,
    private recordService: RecordService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeYearList();
    this.getSDGs();
    this.getSdoUsers();
  }

  initializeYearList(): void {
    const currentYear = new Date().getFullYear();
    this.yearList = [currentYear, currentYear - 1, currentYear - 2];
    this.selectedYear = currentYear;
  }

  getSDGs(): void {
    this.sdgsService.getAllSdgs().subscribe({
      next: (res) => {
        this.sdgsList = res.data || res;
        if (this.sdgsList.length > 0) {
          this.selectedSdg = this.sdgsList[0].sdg_id;
          this.onSdgOrYearChange();
        }
      },
      error: (err) => console.error('Failed to fetch SDGs:', err),
    });
  }

  getSdoUsers(): void {
    this.userService.getSdoUsers().subscribe({
      next: (res: any) => {
        this.sdoUsers = res.data || [];
        this.onSdgOrYearChange();
      },
      error: (err) => console.error('Failed to fetch SDO users:', err),
    });
  }

  onSdoChange(userId: string): void {
    this.selectedSdoUser = parseInt(userId);
    this.onSdgOrYearChange();
  }

  onSdgOrYearChange(): void {
    if (
      this.selectedSdg &&
      this.selectedYear &&
      this.selectedSdoUser !== null
    ) {
      this.loadInstrumentAndRecord();
    }
  }

  loadInstrumentAndRecord(): void {
    this.instrument = { sections: [] };
    this.fieldValues = [];
    this.contentFormulas = {};
    this.recordId = null;

    this.recordService.getInstrumentByID(this.selectedSdg!).subscribe({
      next: (res) => {
        this.instrument = res?.data || { sections: [] };
        this.extractFields();
        this.loadUserRecord();
      },
      error: (err) => console.error('Failed to fetch instrument:', err),
    });
  }

  loadUserRecord(): void {
    this.recordService
      .getUserRecord(
        this.instrument.instrument_id,
        this.selectedSdoUser!,
        this.selectedYear!
      )
      .subscribe({
        next: (res) => {
          if (res?.record_id && Array.isArray(res.answers)) {
            this.recordId = res.record_id;

            // ✅ Add this line
            this.currentStatus = res.status;

            for (const field of this.fieldValues) {
              const match = res.answers.find(
                (a: any) => a.sub_id === field.sub_id
              );
              if (match) field.field_value = match.field_value;
            }
            this.currentTotal = this.getTotalScore();
          }
        },
        error: () => {
          this.recordId = null;
        },
      });
  }

  extractFields(): void {
    this.fieldValues = [];
    this.contentFormulas = {};

    for (const section of this.instrument?.sections || []) {
      for (const content of section.contents) {
        if (content.no && content.formula) {
          this.contentFormulas[content.no] = content.formula;
        }

        for (const cell of content.cells) {
          this.fieldValues.push({ sub_id: cell.sub_id, field_value: '' });
        }
      }
    }
  }

  getFieldValue(sub_id: string): string {
    return this.fieldValues.find((f) => f.sub_id === sub_id)?.field_value || '';
  }

  setFieldValue(sub_id: string, value: string): void {
    const field = this.fieldValues.find((f) => f.sub_id === sub_id);
    if (field) field.field_value = value;
    this.currentTotal = this.getTotalScore();
  }

  evaluateFormula(contentNo: string): number | string {
    const formula = this.contentFormulas[contentNo];
    if (!formula) return '';

    let expression = formula;

    for (const field of this.fieldValues) {
      let value: string | number = field.field_value.trim();

      // Check if value is a number
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        value = numericValue;
      } else {
        // Quote string values like Yes/No
        value = `'${value}'`;
      }

      const regex = new RegExp(`\\b${field.sub_id}\\b`, 'g');
      expression = expression.replace(regex, value.toString());
    }

    console.log(expression, 'Asd');

    try {
      const jsExpression = this.convertExcelIfToJS(expression);
      const result = Function(`return (${jsExpression})`)();
      if (typeof result === 'number') {
        return parseFloat(result.toFixed(2));
      }
      return result;
    } catch (err) {
      console.warn('Formula error:', err);
      return '⚠️';
    }
  }

  convertExcelIfToJS(formula: string): string {
    let converted = formulaConverter.toJavaScript(formula);
    return eval(converted) || 0;
  }

  getTotalScore(): number {
    let total = 0;
    for (const section of this.instrument?.sections || []) {
      for (const content of section.contents) {
        const result = this.evaluateFormula(content.no);
        if (typeof result === 'number' && !isNaN(result)) {
          total += result;
        }
      }
    }
    return parseFloat(total.toFixed(2));
  }

  onSubmit(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: this.recordId
        ? 'You are updating your answers.'
        : 'You are submitting new answers.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = {
        instrument_id: this.instrument.instrument_id,
        user_id: this.selectedSdoUser!,
        year: this.selectedYear!,
        answers: this.fieldValues,
      };

      const request$ = this.recordId
        ? this.recordService.updateAnswers(this.recordId, payload.answers)
        : this.recordService.submitAnswers(payload);

      request$.subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: this.recordId
              ? 'Your answers have been updated.'
              : 'Your answers have been submitted.',
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong. Please try again.',
          });
        },
      });
    });
  }

  showStatusModal: boolean = false;
  selectedStatus: string | null = null;
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'For Revision', value: 'for_revision' },
  ];

  // This should hold the record ID to be updated
  selectedRecordId: number | null = null;

  // Call this to open the modal
  openStatusModal(recordId: number, currentStatus: string) {
    this.selectedRecordId = recordId;
    this.selectedStatus = currentStatus;
    this.showStatusModal = true;
  }

  // Save changes
  updateRecordStatus() {
    if (!this.selectedRecordId || !this.selectedStatus) return;

    this.recordService
      .updateStatus(this.selectedRecordId, this.selectedStatus)
      .subscribe({
        next: () => {
          Swal.fire('Updated!', 'Record status has been updated.', 'success');
          this.showStatusModal = false;
          this.loadInstrumentAndRecord(); // Reload data
        },
        error: () => {
          Swal.fire('Error', 'Failed to update record status.', 'error');
        },
      });
  }
}
