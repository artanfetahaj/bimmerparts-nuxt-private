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
}): Promise<GeocodeAutocompleteResponse | null> => {
  try {
    const params = new URLSearchParams({ postcode: payload.postcode, house_number: payload.house_number })
    if (payload.house_number_addition) params.set('house_number_addition', payload.house_number_addition)
    const response = await $fetch<GeocodeAutocompleteResponse>(`/api/geocode?${params}`)
    return response
  } catch {
    return null
  }
}
