import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, throwError } from 'rxjs';
import { delay, map, catchError, finalize } from 'rxjs/operators';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([
    { id: 1, title: 'Learn Angular Signals', status: 'Pending' },
    { id: 2, title: 'Build Task Manager UI', status: 'In Progress' },
    { id: 3, title: 'Write unit tests', status: 'Completed' }
  ]);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');
  private searchSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<string>('All');

  tasks$ = this.tasksSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  search$ = this.searchSubject.asObservable();
  filter$ = this.filterSubject.asObservable();

  filteredTasks$: Observable<Task[]> = combineLatest([
    this.tasks$,
    this.search$,
    this.filter$
  ]).pipe(
    map(([tasks, searchTerm, statusFilter]) => {
      return tasks.filter(task => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesFilter =
          statusFilter === 'All' || task.status === statusFilter;

        return matchesSearch && matchesFilter;
      });
    })
  );

  getTasks(): Observable<Task[]> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    return of(this.tasksSubject.value).pipe(
      delay(700),
      catchError(() => {
        this.errorSubject.next('Failed to load tasks');
        return throwError(() => new Error('Failed to load tasks'));
      }),
      finalize(() => this.loadingSubject.next(false))
    );
  }

  setSearchTerm(term: string): void {
    this.searchSubject.next(term);
  }

  setFilter(status: string): void {
    this.filterSubject.next(status);
  }

  addTask(task: Omit<Task, 'id'>): void {
    const currentTasks = this.tasksSubject.value;
    const newTask: Task = {
      id: Date.now(),
      ...task
    };
    this.tasksSubject.next([newTask, ...currentTasks]);
  }

  updateTask(updatedTask: Task): void {
    const updatedTasks = this.tasksSubject.value.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    this.tasksSubject.next(updatedTasks);
  }

  deleteTask(id: number): void {
    const updatedTasks = this.tasksSubject.value.filter(task => task.id !== id);
    this.tasksSubject.next(updatedTasks);
  }

  getTaskById(id: number): Task | undefined {
    return this.tasksSubject.value.find(task => task.id === id);
  }

  getStatuses(): TaskStatus[] {
    return ['Pending', 'In Progress', 'Completed'];
  }
}