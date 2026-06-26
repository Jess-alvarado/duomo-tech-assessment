import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppError } from '../../../../core/models/app-error';
import { PersonStateService } from '../../services/person-state';
import { PersonService } from '../../services/person';
import { Person } from '../../model/person';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css'
})
export class PersonList implements OnInit {

  errorMessage = '';
  successMessage = '';
  deletingId: number | null = null;

  private readonly selectedPersonSignal = signal<Person | null>(null);
  private readonly loadingDetailSignal = signal<boolean>(false);

  readonly selectedPerson = this.selectedPersonSignal.asReadonly();
  readonly loadingDetail = this.loadingDetailSignal.asReadonly();

  constructor(
    public state: PersonStateService,
    private personService: PersonService
  ) {}

  ngOnInit(): void {
    this.state.load();
  }

  onDeletePerson(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    const confirmed = confirm('¿Estás seguro(a) de que deseas eliminar a esta persona?');
    if (!confirmed) {
      return;
    }

    this.clearMessages();
    this.deletingId = id;

    this.state.delete(
      id,
      () => {
        this.deletingId = null;
        this.successMessage = 'Persona eliminada.';
      },
      (error: AppError) => {
        this.deletingId = null;
        this.errorMessage = error.message;
      }
    );
  }

  onViewDetail(id: number | undefined): void {
    if (id === undefined) {
      return;
    }

    this.clearMessages();
    this.loadingDetailSignal.set(true);

    this.personService.getPersonById(id).subscribe({
      next: (person) => {
        this.selectedPersonSignal.set(person);
        this.loadingDetailSignal.set(false);
      },
      error: (error: AppError) => {
        this.loadingDetailSignal.set(false);
        this.errorMessage = error.message;
      }
    });
  }

  closeDetail(): void {
    this.selectedPersonSignal.set(null);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
