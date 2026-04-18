import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks$!: Observable<Task[]>;
  loading$!: Observable<boolean>;
  error$!: Observable<string>;

  searchControl = new FormControl('');
  filterControl = new FormControl('All');

  statuses = ['All', 'Pending', 'In Progress', 'Completed'];

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tasks$ = this.taskService.filteredTasks$;
    this.loading$ = this.taskService.loading$;
    this.error$ = this.taskService.error$;

    this.taskService.getTasks().subscribe();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.taskService.setSearchTerm(value || '');
      });

    this.filterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.taskService.setFilter(value || 'All');
      });
  }

  onEdit(task: Task): void {
    this.router.navigate(['/edit', task.id]);
  }

  onDelete(id: number): void {
    const isConfirmed = confirm('Are you sure you want to delete this task?');
    if (isConfirmed) {
      this.taskService.deleteTask(id);
    }
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}