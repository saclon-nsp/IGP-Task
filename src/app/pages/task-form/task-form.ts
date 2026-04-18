import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  statuses: TaskStatus[] = [];
  isEditMode = false;
  taskId!: number;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.statuses = this.taskService.getStatuses();

    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Pending', Validators.required]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = +id;

      const existingTask = this.taskService.getTaskById(this.taskId);
      if (existingTask) {
        this.taskForm.patchValue({
          title: existingTask.title,
          status: existingTask.status
        });
      }
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    if (this.isEditMode) {
      this.taskService.updateTask({
        id: this.taskId,
        title: formValue.title,
        status: formValue.status
      });
    } else {
      this.taskService.addTask({
        title: formValue.title,
        status: formValue.status
      });
    }

    this.router.navigate(['/']);
  }

  get title() {
    return this.taskForm.get('title');
  }

  get status() {
    return this.taskForm.get('status');
  }
}