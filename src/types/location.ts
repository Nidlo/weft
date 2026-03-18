export interface LocationData {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string | null;
  region: string | null;
  country: string | null;
  countryCode: string | null;
  postalCode: string | null;
  addressLine: string | null;
}
