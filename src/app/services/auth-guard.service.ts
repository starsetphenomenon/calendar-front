import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';

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

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.validGuard || this.localToken) {
      return true;
    }
    return this.router.navigate(['/login']);
  }


}