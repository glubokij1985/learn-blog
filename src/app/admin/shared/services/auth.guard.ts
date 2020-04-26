import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router
    ) { }

    public canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean |  Observable<boolean> | Promise<boolean> {
        if (this.auth.isAuthenticated()) {
            return true;
        } else {
            this.auth.logout();
            this.router.navigate(['/admin', 'login'], {
                queryParams: {
                    loginAgain: true
                }
            });
        }
    }
}
