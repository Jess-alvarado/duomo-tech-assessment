export interface Region {
  id: string;
  name: string;
}

export interface Commune {
  id: string;
  name: string;
  regionId: string;
}
