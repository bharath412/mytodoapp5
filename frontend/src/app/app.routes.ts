import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./tasks/task-list/task-list.component').then(m => m.TaskListComponent) 
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/task-list/task-list.component').then(m => m.TaskListComponent)
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];