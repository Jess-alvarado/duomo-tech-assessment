import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonStateService } from '../../services/person-state';
import { AppError } from '../../../../core/models/app-error';
import { minAgeValidator } from '../../../../validators/min-age';
import { Commune, Region } from '../../model/catalog';
import { CatalogService } from '../../services/catalog';


const MIN_AGE = 18;

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './person-form.html',
  styleUrl: './person-form.css'
})
export class PersonForm implements OnInit {

  personForm!: FormGroup;

  regions: Region[] = [];
  communes: Commune[] = [];

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
    private personState: PersonStateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadRegions();
  }

  private initForm(): void {
    this.personForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, minAgeValidator(MIN_AGE)]],
      regionId: ['', [Validators.required]],
      communeId: ['', [Validators.required]]
    });
  }

  private loadRegions(): void {
    this.catalogService.getRegions().subscribe({
      next: (data) => (this.regions = data),
      error: (err: AppError) => (this.errorMessage = err.message)
    });
  }

  onRegionChange(event: Event): void {
    const regionId = (event.target as HTMLSelectElement).value;

    this.communes = [];
    this.personForm.patchValue({ communeId: '' });

    if (!regionId) {
      return;
    }

    this.catalogService.getCommunesByRegion(regionId).subscribe({
      next: (data) => (this.communes = data),
      error: (err: AppError) => (this.errorMessage = err.message)
    });
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.personForm.get(controlName);
    return !!control && control.touched && control.hasError(errorCode);
  }

  onSubmit(): void {
    this.clearMessages();

    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      return;
    }

    const formValues = this.personForm.value;

    const selectedRegion = this.regions.find((r) => r.id === formValues.regionId);
    const selectedCommune = this.communes.find((c) => c.id === formValues.communeId);

    if (!selectedRegion || !selectedCommune || selectedCommune.regionId !== selectedRegion.id) {
      this.errorMessage = 'La comuna no corresponde a la región seleccionada.';
      return;
    }

    this.submitting = true;

    this.personState.create(
      {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        age: Number(formValues.age),
        region: selectedRegion,
        commune: selectedCommune
      },
      () => {
        this.submitting = false;
        this.successMessage = 'Persona registrada.';
        this.resetForm();
      },
      (error: AppError) => {
        this.submitting = false;
        this.errorMessage = error.message;
      }
    );
  }

  private resetForm(): void {
    this.personForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      age: '',
      regionId: '',
      communeId: ''
    });
    this.communes = [];
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
