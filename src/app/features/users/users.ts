import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import emailjs from '@emailjs/browser';

import { UserService } from './user-service';
import { CampusService } from '../campuses/campus-service';
import { generatePassword } from '../../../shared/services/utils/password.generator';

@Component({
  selector: 'app-users',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ToastModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: any[] = [];
  campuses: any[] = [];

  // Pagination + Search
  pageNo: number = 0;
  pageSize: number = 10;
  keyword: string = '';
  totalRecords: number = 0;

  // Form + Dialog
  userForm!: FormGroup;
  showAddUserDialog: boolean = false;
  editMode: boolean = false;
  editingUserId: number | null = null;

  constructor(
    private userService: UserService,
    private campusService: CampusService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.fetchCampuses();
    this.userForm = this.fb.group({
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      email_address: ['', [Validators.required, Validators.email]],
      contact_number: [''],
      campus_id: [''],
      role: ['csdo', Validators.required],
    });
  }

  fetchUsers(): void {
    this.userService
      .getUsers({
        pageNo: this.pageNo + 1,
        pageSize: this.pageSize,
        keyword: this.keyword,
      })
      .subscribe({
        next: (response: any) => {
          this.users = response.data;
          this.totalRecords = response.total;
        },
        error: (err) => {
          console.error('Failed to fetch users:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch users',
          });
        },
      });
  }

  fetchCampuses(): void {
    this.campusService.getCampusesForDropdown().subscribe({
      next: (response: any) => {
        this.campuses = response.data;
      },
      error: (err) => {
        console.error('Failed to fetch campuses:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch campuses',
        });
      },
    });
  }

  onKeywordChange(): void {
    this.pageNo = 0;
    this.fetchUsers();
  }

  onPageChange(event: any): void {
    this.pageNo = event.first / event.rows;
    this.pageSize = event.rows;
    this.fetchUsers();
  }

  handleAddUserDialog(): void {
    this.editMode = false;
    this.editingUserId = null;
    this.userForm.reset({
      first_name: '',
      middle_name: '',
      last_name: '',
      email_address: '',
      contact_number: '',
      campus_id: '',
      role: '',
    });
    this.showAddUserDialog = true;
  }
  onEditUser(user: any): void {
    this.editMode = true;
    this.editingUserId = user.user_id;
    this.showAddUserDialog = true;

    this.userForm.patchValue({
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      email_address: user.email_address,
      contact_number: user.contact_number,
      campus_id: user.campus_id,
      role: user.role,
    });
  }

  onRoleChange(role: string): void {
    this.userForm.get('role')?.setValue(role);

    // Optional: Clear campus if role is not SDO
    if (role !== 'sdo') {
      this.userForm.get('campus_id')?.setValue(null);
    }
  }

  // submitUser(): void {
  //   if (this.userForm.invalid) return;
  //   const formData = this.userForm.value;
  //   formData.password = generatePassword();
  //   if (this.editMode && this.editingUserId !== null) {
  //     this.userService.updateUser(this.editingUserId, formData).subscribe({
  //       next: () => {
  //         this.fetchUsers();
  //         this.resetFormState();
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Updated',
  //           detail: 'User updated successfully',
  //         });
  //       },
  //       error: (err) => {
  //         console.error('Failed to update user:', err);
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Update Failed',
  //           detail: 'Could not update user',
  //         });
  //       },
  //     });
  //   } else {
  //     console.log('ASDsa');

  //     this.userService.addUser(formData).subscribe({
  //       next: () => {
  //         emailjs.send('service_1loz18m', 'template_3whvkud', formData, {
  //           publicKey: 'Tk0dwltnMUtiBGM46',
  //         });

  //         this.fetchUsers();
  //         this.resetFormState();
  //         this.messageService.add({
  //           severity: 'success',
  //           summary: 'Created',
  //           detail: 'User created successfully',
  //         });
  //       },
  //       error: (err) => {
  //         console.error('Failed to add user:', err);
  //         this.messageService.add({
  //           severity: 'error',
  //           summary: 'Creation Failed',
  //           detail: 'Could not create user',
  //         });
  //       },
  //     });
  //   }
  // }

  async submitUser(): Promise<void> {
    if (this.userForm.invalid) return;

    const formData = this.userForm.value;
    formData.password = generatePassword();

    if (this.editMode && this.editingUserId !== null) {
      this.userService.updateUser(this.editingUserId, formData).subscribe({
        next: () => {
          this.fetchUsers();
          this.resetFormState();
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'User updated successfully',
          });
        },
        error: (err) => {
          console.error('Failed to update user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: 'Could not update user',
          });
        },
      });
    } else {
      this.userService.addUser(formData).subscribe({
        next: async () => {
          try {
            await emailjs.send(
              'service_1loz18m',
              'template_3whvkud',
              formData,
              {
                publicKey: 'Tk0dwltnMUtiBGM46',
              }
            );

            this.fetchUsers();
            this.resetFormState();
            this.messageService.add({
              severity: 'success',
              summary: 'Created',
              detail: 'User created successfully and email sent',
            });
          } catch (err) {
            console.error('Email sending failed:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Email Failed',
              detail: 'User created, but email sending failed.',
            });
          }
        },
        error: (err) => {
          console.error('Failed to add user:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Creation Failed',
            detail: 'Could not create user',
          });
        },
      });
    }
  }

  resetFormState(): void {
    this.userForm.reset({
      first_name: '',
      middle_name: '',
      last_name: '',
      email_address: '',
      contact_number: '',
      campus_id: '',
      role: '',
    });
    this.editingUserId = null;
    this.editMode = false;
    this.showAddUserDialog = false;
  }
}
