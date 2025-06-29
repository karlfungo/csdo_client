import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampusService } from '../campuses/campus-service';
import { ChartModule } from 'primeng/chart';
import { DashboardService } from './dashboard-service';
import formulaConverter from 'excel-formula';
import { Sdgs } from '../../../shared/services/sdgs/sdgs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  // Dropdowns
  campusOptions: any[] = [];
  selectedCampus: number | null = null;

  yearOptions: number[] = [];
  selectedYear: number | null = null;

  // Charts
  statusChartData: any;
  sdgChartData: any;
  chartOptions: any;
  barChartOptions: any;
  sdgScoreData: any;

  selectedSdgId: number | null = null; // default: no filter (all SDGs)
  scoreData: any;

  constructor(
    private campusService: CampusService,
    private reportService: DashboardService,
    private sdgsService: Sdgs // ← Inject Sdgs service
  ) {}

  ngOnInit(): void {
    this.generateYearOptions();
    this.getCampusesDropdown();
    this.initChartOptions();
    this.loadCampusRankings();
    this.loadAllSdgs(); // Load SDGs on init
  }

  onSdgChange(sdgId: number | null): void {
    this.selectedSdgId = sdgId;
    this.loadCampusRankings();
  }
  loadAllSdgs(): void {
    this.sdgsService.getAllSdgs().subscribe({
      next: (res) => {
        this.sdgList = res.data || [];
        this.selectedSdgId = this.sdgList[0].sdg_id;
      },
      error: (err) => {
        console.error('Failed to load SDGs:', err);
      },
    });
  }

  generateYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.yearOptions = [currentYear, currentYear - 1, currentYear - 2];
    this.selectedYear = this.yearOptions[0];
  }

  getProgressBarWidth(score: number): number {
    const maxScore = Math.max(...this.rankings.map((r) => r.total_score), 1);
    return (score / maxScore) * 100;
  }

  getCampusesDropdown(): void {
    this.campusService.getCampusesForDropdown().subscribe({
      next: (res) => {
        this.campusOptions = res.data || [];
        if (this.campusOptions.length > 0) {
          this.selectedCampus = this.campusOptions[0].campus_id;
          this.loadSummaryData();
          this.loadUserSdgScores();
        }
      },
      error: (err) => {
        console.error('Error loading campuses:', err);
      },
    });
  }

  onCampusChange(campusId: number | null): void {
    this.selectedCampus = campusId;
    this.loadSummaryData();
    this.loadUserSdgScores();
  }

  onYearChange(year: number | null): void {
    this.selectedYear = year;
    this.loadSummaryData();
    this.loadUserSdgScores();
    this.loadCampusRankings(); // ← add this
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#374151', // Tailwind gray-700
            font: {
              size: 14,
              family: 'Poppins',
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    };
    this.barChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#374151',
            font: {
              size: 12,
              family: 'Poppins',
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#374151',
            font: {
              size: 12,
              family: 'Poppins',
            },
            stepSize: 1,
          },
          grid: {
            color: '#e5e7eb', // Tailwind gray-200
          },
        },
      },
    };
  }

  loadSummaryData(): void {
    const campusId = this.selectedCampus ?? undefined;
    const year = this.selectedYear ?? undefined;

    this.reportService.getStatusAndSdgSummary(campusId, year).subscribe({
      next: (res: any) => {
        const summary = res.data?.[0]?.get_dashboard_data;

        if (summary) {
          this.prepareStatusChart(summary.status_counts);
          this.prepareSdgChart(summary.sdg_counts);
        } else {
          console.error('No dashboard summary found in response');
        }
      },
      error: () => {
        console.error('Failed to load summary data');
      },
    });
  }

  scores: any = [];
  sdgList: any[] = [];

  rankings: any[] = [];

  loadCampusRankings(): void {
    const year = this.selectedYear ?? new Date().getFullYear();

    this.reportService
      .getCampusRankings(year, this.selectedSdgId as number)
      .subscribe({
        next: (res: any) => {
          const allCampuses = res.data || [];

          this.rankings = allCampuses
            .map((campus: any) => {
              let totalScore = 0;

              const users = campus.campus_users ?? [];

              for (const user of users) {
                for (const sdg of user.sdgs || []) {
                  let score = 0;

                  if (sdg.records?.length > 0) {
                    const record = sdg.records[0];
                    const valueMap: Record<string, number> = {};

                    for (const v of record.values || []) {
                      let value = v.field_value;

                      // Check if value is numeric
                      const numericValue = parseFloat(value);
                      if (!isNaN(numericValue) && isFinite(numericValue)) {
                        value = numericValue;
                      } else {
                        // Quote non-numeric values
                        value = `'${value}'`;
                      }

                      valueMap[v.sub_id] = value;
                    }

                    for (const formula of sdg.formulas || []) {
                      try {
                        let expr = formula;

                        // Replace sub_ids with values
                        for (const sub_id in valueMap) {
                          const value = valueMap[sub_id];
                          const regex = new RegExp(`\\b${sub_id}\\b`, 'g');
                          expr = expr.replace(regex, value.toString());
                        }

                        // Replace any unmatched sub_ids like H999 with 0
                        expr = expr.replace(/\bH\d+\b/g, '0');

                        const jsExpr = formulaConverter.toJavaScript(
                          expr.replace(/^=/, '')
                        );

                        console.log(jsExpr, 'Asd');

                        const result = Function(`return (${jsExpr})`)();

                        if (typeof result === 'number' && !isNaN(result)) {
                          score += parseFloat(result.toFixed(2));
                        }
                      } catch (err) {
                        console.warn(
                          `Error evaluating formula for campus ${campus.campus_id}:`,
                          err
                        );
                      }
                    }
                  }

                  totalScore += score;
                }
              }

              return {
                campus_id: campus.campus_id,
                campus_name: campus.campus_name,
                total_score: parseFloat(totalScore.toFixed(2)),
              };
            })
            .filter((campus: any) => campus.total_score > 0) // Optional: filter out campuses with 0 score
            .sort((a: any, b: any) => b.total_score - a.total_score);

          console.log(this.rankings, '→ Final Rankings');
        },
        error: (err) => {
          console.error('Failed to load campus rankings:', err);
        },
      });
  }

  // loadUserSdgScores(): void {
  //   if (!this.selectedCampus || !this.selectedYear) return;

  //   this.reportService
  //     .getScores(this.selectedCampus, this.selectedYear)
  //     .subscribe({
  //       next: (data: any) => {
  //         this.scoreData = data || [];
  //         console.log('User SDG Scores:', this.scoreData);
  //         // You can transform or visualize this if needed
  //       },
  //       error: (err) => {
  //         console.error('Failed to load user SDG scores:', err);
  //       },
  //     });
  // }

  loadUserSdgScores(): void {
    if (!this.selectedCampus || !this.selectedYear) return;

    this.reportService
      .getScores(this.selectedCampus, this.selectedYear)
      .subscribe({
        next: (res: any) => {
          const rawData = res.data || [];

          this.scoreData = rawData.map((sdg: any) => {
            let totalScore = 0;

            // If no records, return 0 score
            if (
              !sdg.records ||
              sdg.records.length === 0 ||
              !Array.isArray(sdg.records)
            ) {
              return {
                sdg_no: sdg.sdg_no,
                sdg_name: sdg.sdg_name,
                score: 0,
              };
            }

            const record = sdg.records[0]; // Assume only one record per SDG
            const valueMap: Record<string, number> = {};

            for (const v of record.values || []) {
              valueMap[v.sub_id] = parseFloat(v.field_value) || v.field_value;
            }

            for (const formula of sdg.formulas || []) {
              try {
                let expr = formula;

                for (const sub_id in valueMap) {
                  let value: string | number = valueMap[sub_id];
                  console.log(value, 'ngani');

                  // Ensure the value is treated as string for parseFloat
                  const numericValue = parseFloat(value.toString());
                  if (!isNaN(numericValue) && isFinite(numericValue)) {
                    value = numericValue;
                  } else {
                    value = `'${value}'`; // quote for string use in formula
                  }

                  const safeSubId = sub_id.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                  );
                  const regex = new RegExp(`\\b${safeSubId}\\b`, 'g');
                  console.log(expr, 'A');

                  expr = expr.replace(regex, value.toString());
                  console.log(expr, 'B');
                }

                // Replace any unused sub_ids (like H234) with 0
                expr = expr.replace(/\bH\d+\b/g, '0');

                // Convert formula to valid JS (strip starting = if present)
                const jsExpr = formulaConverter.toJavaScript(
                  expr.replace(/^=/, '')
                );

                // Evaluate the expression
                const score = Function(`return (${jsExpr})`)();

                if (typeof score === 'number' && !isNaN(score)) {
                  totalScore += parseFloat(score.toFixed(2));
                }
              } catch (err) {
                console.warn(
                  `Failed to evaluate formula for SDG ${sdg.sdg_no}:`,
                  err
                );
              }
            }

            return {
              sdg_no: sdg.sdg_no,
              sdg_name: sdg.sdg_name,
              score: totalScore,
            };
          });

          this.scores = this.scoreData;
          // Update the chart data dynamically
          this.sdgScoreData = {
            labels: this.scores.map((item: any) => `SDG ${item.sdg_no}`),
            datasets: [
              {
                label: 'Score',
                data: this.scores.map((item: any) => item.score),
                backgroundColor: '#4CAF50',
              },
            ],
          };
          console.log('User SDG Scores:', this.scoreData);
        },
        error: (err) => {
          console.error('Failed to load user SDG scores:', err);
        },
      });
  }

  prepareStatusChart(statusCounts: any[]): void {
    const labels = statusCounts.map((item) => item.status);
    const data = statusCounts.map((item) => item.count);

    this.statusChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        },
      ],
    };
  }

  prepareSdgChart(sdgCounts: any[]): void {
    const labels = sdgCounts.map((item) => 'SDG' + item.sdg);
    const data = sdgCounts.map((item) => item.count);

    this.sdgChartData = {
      labels,
      datasets: [
        {
          label: 'SDG Count',
          backgroundColor: '#3B82F6',
          data,
        },
      ],
    };
  }

  sdgScoreOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'SDG Scores',
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Score',
        },
      },
      x: {
        title: {
          display: true,
          text: 'SDGs',
        },
      },
    },
  };
}
