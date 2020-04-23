import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { User, FbAuthResponse } from '../../../shared/interfaces';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthService {

    public error$: Subject<string> = new Subject<string>();

    constructor(
        private http: HttpClient
    ) { }

    public get token(): string {
        const expDate = new Date(localStorage.getItem('fb-token-exp'));
        if (new Date() > expDate) {
            this.logout();
            return null;
        }
        return localStorage.getItem('fb-token');
    }

    public login(user: User): Observable<any> {
        user.returnSecureToken = true;
        return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
            .pipe(
                tap(this.setToken),
                catchError(this.handleError.bind(this))
            );
    }

    public logout() {
        this.setToken(null);
    }

    public isAuthenticated(): boolean {
        return !!this.token;
    }

    private handleError(error: HttpErrorResponse) {
        const { message } = error.error.error;

        switch (message) {
            case 'INVALID_EMAIL':
                this.error$.next('Email is invalid');
                break;
            case 'INVALID_PASSWORD':
                this.error$.next('Password is invalid');
                break;
            case 'EMAIL_NOT_FOUND':
                this.error$.next('Email is not exist');
                break;
        }

        return throwError(error);
    }

    private setToken(response: FbAuthResponse | null) {
        if (response) {
            const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
            localStorage.setItem('fb-token', response.idToken);
            localStorage.setItem('fb-token-exp', expDate.toString());
        } else {
            localStorage.clear();
        }
    }
}
