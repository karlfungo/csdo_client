import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Auth } from '../auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-screen',
  imports: [ReactiveFormsModule],
  templateUrl: './login-screen.html',
  styleUrl: './login-screen.css',
})
export class LoginScreen {
  loginCredentials!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginCredentials = this.fb.group({
      email_address: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      role: ['csdo'],
    });
  }

  onSubmit() {
    if (this.loginCredentials.valid) {
      this.authService.authLogin(this.loginCredentials.value).subscribe({
        next: (response: any) => {
          if (response.status === 'FAILED') {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: response.message || 'Invalid login credentials.',
            });
            return;
          }

          const { token, user } = response.data;

          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user_id', user.user_id.toString());
          sessionStorage.setItem('full_name', user.full_name);
          sessionStorage.setItem('email_address', user.email_address);
          user.campus_id &&
            sessionStorage.setItem('campus_id', user.campus_id.toString());

          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          // ❌ HTTP or unexpected server error
          Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: error?.message || 'Something went wrong!',
          });
        },
      });
    } else {
      // ❌ Form validation failed
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill in all required fields correctly.',
      });
    }
  }
}
