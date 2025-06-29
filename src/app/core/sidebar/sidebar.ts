import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(public router: Router) {}

  navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi-gauge' },
    { label: 'Campuses', path: '/campuses', icon: 'pi-building' },
    { label: 'Users', path: '/users', icon: 'pi-users' },
    { label: 'Annual Report', path: '/annual-report', icon: 'pi-users' },
    { label: 'Instruments', path: '/instruments', icon: 'pi-book' },
    { label: 'Records', path: '/records', icon: 'pi-database' },
  ];

  ngOnInit() {
    console.log('Current Route:', this.router.url);
    this.navItems.forEach((item) => {
      const isActive = this.router.url.startsWith(item.path);
      console.log(`Match for ${item.path}?`, isActive);
    });
  }
}
