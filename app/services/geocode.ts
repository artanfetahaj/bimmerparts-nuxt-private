import { Config } from '../models/Config';
import axios from 'axios';

export type GeocodeAutocompleteResponse = {
  constructionYear: number;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  municipality: string;
  postcode: string;
  province: string;
  purposes: string[];
  city: string;
  street: string;
  house_number: number;
  surfaceArea: number;
}

export const autocompleteAddress = async (payload: {
  postcode: string;
  house_number: string;
  house_number_addition?: string;
}) => {
  const defaultHeaders: { [key: string]: string } = {
    'X-Api-Key': `${import.meta.env.VITE_GEOCODE_API_KEY}`
  }

  const token = Config.get('access')
  if (typeof token !== 'undefined') {
    defaultHeaders.Authorization = `Bearer ${token}`
  }

  const apiUrl = `${import.meta.env.VITE_GEOCODE_API_URL}/autocomplete`;

  try {
    const response = await axios.get(apiUrl, {
      headers: defaultHeaders,
      params: payload,
    });
    return response.data as GeocodeAutocompleteResponse;
  } catch (error) {
    return null;
  }
}
