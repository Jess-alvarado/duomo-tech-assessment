import { Component } from '@angular/core';
import { PersonList } from './features/persons/components/person-list/person-list';
import { PersonForm } from './features/persons/components/person-form/person-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PersonList, PersonForm],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = 'Gestión de Personas';
}
