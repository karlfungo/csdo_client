import { Routes } from '@angular/router';
import { Main } from './core/main/main';
import { Dashboard } from './features/dashboard/dashboard';
import { Campuses } from './features/campuses/campuses';
import { Instruments } from './features/instruments/instruments';
import { AddInstrument } from './features/instruments/add-instrument/add-instrument';
import { Users } from './features/users/users';
import { Records } from './features/records/records';
import { AnualReport } from './features/anual-report/anual-report';
import { LoginScreen } from './auth/login-screen/login-screen';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginScreen,
  },
  {
    path: '',
    component: Main,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'campuses',
        component: Campuses,
      },
      {
        path: 'instruments',
        component: Instruments,
      },
      { path: 'add-instrument', component: AddInstrument },
      { path: 'users', component: Users },
      { path: 'records', component: Records },
      { path: 'annual-report', component: AnualReport },
    ],
  },
];
