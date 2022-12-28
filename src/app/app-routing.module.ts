import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LoginPage } from './components/login-page/login-page';
import { RegisterPage } from './components/register-page/register-page';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
    { path: '', redirectTo: '/login', title: 'Login', pathMatch: 'full' },
    { path: 'calendar', canActivate: [AuthGuardService], title: 'Calendar', component: CalendarComponent },
    { path: 'login', title: 'Login', component: LoginPage },
    { path: 'register', title: 'Register', component: RegisterPage },
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }