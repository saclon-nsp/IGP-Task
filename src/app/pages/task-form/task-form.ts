import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId!: number;
  statuses = ['Pending', 'In Progress', 'Completed'];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Pending', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.taskId = +idParam;

      this.taskService.getTaskById(this.taskId).subscribe(existingTask => {
        if (existingTask) {
          this.taskForm.patchValue({
            title: existingTask.title,
            status: existingTask.status
          });
        }
      });
    }
  }

  get title() {
    return this.taskForm.get('title');
  }

  get status() {
    return this.taskForm.get('status');
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;

    if (this.isEditMode) {
      const updatedTask: Task = {
        id: this.taskId,
        title: formValue.title,
        status: formValue.status
      };

      this.taskService.updateTask(updatedTask).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.taskService.addTask({
        title: formValue.title,
        status: formValue.status
      }).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}