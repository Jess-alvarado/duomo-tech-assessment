import { Commune, Region } from "./catalog";

export interface Person {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  region: Region;
  commune: Commune;
}

export type CreatePersonPayload = Omit<Person, 'id'>;
