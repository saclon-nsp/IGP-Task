import { Routes } from '@angular/router';
import { TaskListComponent } from './pages/task-list/task-list';
import { TaskFormComponent } from './pages/task-form/task-form';

export const routes: Routes = [
  { path: '', component: TaskListComponent },
  { path: 'add', component: TaskFormComponent },
  { path: 'edit/:id', component: TaskFormComponent },
  { path: '**', redirectTo: '' }
];