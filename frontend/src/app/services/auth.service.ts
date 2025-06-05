import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
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
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(storedUser);
      this.tokenSubject.next(storedToken);
    }
  }
  
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const request: RegistrationRequest = { username, email, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }
  
  login(username: string, password: string): Observable<AuthResponse> {
    const request: LoginRequest = { username, password };
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }
  
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  // Add the missing method
  checkTokenValidity(): void {
    const token = this.getToken();
    const username = localStorage.getItem('currentUser');
    
    if (token && username) {
      // For a real implementation, you might want to validate the token with the server
      // Here we're just updating the BehaviorSubject with the stored values
      this.currentUserSubject.next(username);
      this.tokenSubject.next(token);
    } else {
      this.logout();
    }
  }
  
  private handleAuthentication(response: AuthResponse): void {
    localStorage.setItem('currentUser', response.username);
    localStorage.setItem('token', response.token);
    this.currentUserSubject.next(response.username);
    this.tokenSubject.next(response.token);
  }
}