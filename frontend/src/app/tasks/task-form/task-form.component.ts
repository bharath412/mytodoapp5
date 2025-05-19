import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  task: Task = {
    title: '',
    description: '',
    completed: false
  };
  
  isEditMode = false;
  loading = false;
  error = '';
  
  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.loadTask(+id);
    }
  }
  
  loadTask(id: number): void {
    this.loading = true;
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load task. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  saveTask(): void {
    if (!this.task.title.trim()) {
      this.error = 'Task title is required';
      return;
    }
    
    this.loading = true;
    
    if (this.isEditMode) {
      this.taskService.updateTask(this.task.id!, this.task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.error = 'Failed to update task. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.taskService.createTask(this.task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.error = 'Failed to create task. Please try again.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}