import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
  ) { }

  validGuard: boolean = false;
  localToken: string = JSON.parse(localStorage.getItem('token') as string);
  setGuard(state: boolean) {
    return this.validGuard = state;
  }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.validGuard || this.localToken) {
      return true;
    }
    return this.router.navigate(['/login']);
  }


}
