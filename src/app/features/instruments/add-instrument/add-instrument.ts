import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Sdgs } from '../../../../shared/services/sdgs/sdgs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Instrument } from '../instrument';

@Component({
  selector: 'app-add-instrument',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './add-instrument.html',
  styleUrls: ['./add-instrument.css'],
})
export class AddInstrument implements OnInit {
  sdgsList: any[] = [];
  selectedSdg: number | null = null;
  formError: string = '';

  sdgSections = [
    {
      no: '',
      subtitle: '',
      contents: [
        {
          no: '',
          content: '',
          formula: '', // ✅ Add formula here
          cells: [
            {
              sub_id: '',
              question: '',
              type: 'text',
              options: [] as string[],
            },
          ],
        },
      ],
    },
  ];

  constructor(
    private sdgsService: Sdgs,
    private instrumentService: Instrument,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSDGs();
  }

  getSDGs(): void {
    this.sdgsService.getAllSdgs().subscribe({
      next: (res) => {
        this.sdgsList = res.data || res;
      },
      error: (err) => {
        console.error('Failed to fetch SDGs:', err);
      },
    });
  }

  addSection(): void {
    this.sdgSections.push({
      no: '',
      subtitle: '',
      contents: [], // ✅ removed formula
    });
  }

  removeSection(index: number): void {
    this.sdgSections.splice(index, 1);
  }

  addContent(sectionIndex: number): void {
    this.sdgSections[sectionIndex].contents.push({
      no: '',
      content: '',
      formula: '', // ✅ added
      cells: [],
    });
  }

  removeContent(sectionIndex: number, contentIndex: number): void {
    this.sdgSections[sectionIndex].contents.splice(contentIndex, 1);
  }

  addCell(sectionIndex: number, contentIndex: number): void {
    this.sdgSections[sectionIndex].contents[contentIndex].cells.push({
      sub_id: '',
      question: '',
      type: 'text',
      options: [],
    });
  }

  removeCell(
    sectionIndex: number,
    contentIndex: number,
    cellIndex: number
  ): void {
    this.sdgSections[sectionIndex].contents[contentIndex].cells.splice(
      cellIndex,
      1
    );
  }

  addOption(
    sectionIndex: number,
    contentIndex: number,
    cellIndex: number
  ): void {
    const cell =
      this.sdgSections[sectionIndex].contents[contentIndex].cells[cellIndex];
    if (!cell.options) {
      cell.options = [];
    }
    cell.options.push('');
  }

  removeOption(
    sectionIndex: number,
    contentIndex: number,
    cellIndex: number,
    optionIndex: number
  ): void {
    this.sdgSections[sectionIndex].contents[contentIndex].cells[
      cellIndex
    ].options.splice(optionIndex, 1);
  }

  submitForm(): void {
    this.formError = '';

    if (!this.selectedSdg) {
      this.formError = 'Please select an SDG.';
      return;
    }

    for (let i = 0; i < this.sdgSections.length; i++) {
      const section = this.sdgSections[i];
      if (!section.no || !section.subtitle) {
        this.formError = `Section ${i + 1} is incomplete.`;
        return;
      }

      for (let j = 0; j < section.contents.length; j++) {
        const content = section.contents[j];
        if (!content.no || !content.content) {
          this.formError = `Content ${j + 1} in Section ${
            i + 1
          } is incomplete.`;
          return;
        }

        for (let k = 0; k < content.cells.length; k++) {
          const cell = content.cells[k];
          if (!cell.question || !cell.sub_id) {
            this.formError = `Cell ${k + 1} in Content ${j + 1}, Section ${
              i + 1
            } is incomplete.`;
            return;
          }
        }
      }
    }

    // ✅ Construct payload
    const payload = {
      sdg_id: this.selectedSdg,
      sections: this.sdgSections,
    };

    // 📤 Call your service to create instrument
    this.instrumentService.createInstrument(payload).subscribe({
      next: (response: any) => {},
      error: (error: Error) => {
        this.formError = 'Something went wrong. Please try again.';
        console.error(error.message);
      },
    });
  }

  submitInstrument(): void {
    if (!this.selectedSdg) {
      alert('Please select an SDG.');
      return;
    }

    for (const section of this.sdgSections) {
      if (!section.no || !section.subtitle) {
        alert('Each section must have a Section No. and Subtitle.');
        return;
      }

      for (const content of section.contents) {
        if (!content.no || !content.content) {
          alert('Each content must have a number and description.');
          return;
        }

        for (const cell of content.cells) {
          if (!cell.sub_id || !cell.question) {
            alert('Each cell must have a Sub ID and a Question.');
            return;
          }

          if (cell.type === 'multiple') {
            const hasEmpty = cell.options.some((opt: string) => !opt.trim());
            if (!cell.options.length || hasEmpty) {
              alert('All multiple choice options must be filled.');
              return;
            }
          }
        }
      }
    }

    const payload = {
      sdg_id: this.selectedSdg,
      sections: this.sdgSections,
    };

    this.instrumentService.createInstrument(payload).subscribe({
      next: () => {
        alert('Instrument created successfully!');
        this.router.navigate(['/instruments']);
      },
      error: (err) => {
        console.error(err);
        alert('Failed to create instrument. Please try again.');
      },
    });
  }
}
