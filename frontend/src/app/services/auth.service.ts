import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  token: string;
  username: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  private apiUrl = `${environment.apiUrl}/auth`;
  
  constructor(private http: HttpClient) { 
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(username);
    }
  }
  
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const request: RegistrationRequest = { username, email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }
  
  login(username: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { username, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthentication(response))
    );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }
  
  getToken(): string | null {
    return this.tokenSubject.value;
  }
  
  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }
  
  private handleAuthentication(response: AuthResponse): void {
    const { token, username } = response;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    this.tokenSubject.next(token);
    this.currentUserSubject.next(username);
  }
}
