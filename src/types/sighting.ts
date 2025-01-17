export interface Sighting {
    id: number;
    location: { lat: number; lng: number };
    common_name: string;
    sci_name: string;
    timestamp: string;
    status: string;
  }