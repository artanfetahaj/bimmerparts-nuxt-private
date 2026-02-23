export interface BmwSeriesItem {
  /** Value sent to the API filter (matches `series` field on CarModel) */
  series: string
  /** Dutch display label shown in the UI */
  label: string
  /** Path to the car image in /public/images */
  image: string
}

/**
 * Master list of BMW series.
 * `series` must exactly match the value stored in the `series` column of the
 * car_models table so the API filter works correctly.
 */
export const BMW_SERIES: BmwSeriesItem[] = [
  { series: '1 Series', label: '1 Serie', image: '/images/bmw-1-series.png' },
  { series: '2 Series', label: '2 Serie', image: '/images/BMW-2-Series.png' },
  { series: '3 Series', label: '3 Serie', image: '/images/bmw-3-series.png' },
  { series: '4 Series', label: '4 Serie', image: '/images/bmw-4-series.png' },
  { series: '5 Series', label: '5 Serie', image: '/images/BMW-5-series.png' },
  { series: '6 Series', label: '6 Serie', image: '/images/bmw-6-series.png' },
  { series: '7 Series', label: '7 Serie', image: '/images/bmw-7-series.png' },
  { series: '8 Series', label: '8 Serie', image: '/images/BMW-8-Series.png' },
  { series: 'X',        label: 'X Serie', image: '/images/bmw-x-series.png' },
  { series: 'Z',        label: 'Z Serie', image: '/images/bmw-z-series.png' },
  { series: 'i',        label: 'i Serie', image: '/images/bmw-i8.png'       },
  { series: 'M',        label: 'M Serie', image: '/images/bmw-m-series.png' },
]

/** Resolve the series image from the collection by series string (case-insensitive). */
export function getSeriesImage(series: string): string {
  const match = BMW_SERIES.find(
    s => s.series.toLowerCase() === series.toLowerCase(),
  )
  return match?.image ?? '/images/bmw-1-series.png'
}

/** Resolve the Dutch label for a series string. */
export function getSeriesLabel(series: string): string {
  const match = BMW_SERIES.find(
    s => s.series.toLowerCase() === series.toLowerCase(),
  )
  return match?.label ?? series
}
