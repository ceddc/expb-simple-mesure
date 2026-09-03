import type { ImmutableObject } from 'jimu-core'

export const LABEL_FONT_FAMILIES = ['Arial', 'Noto Sans', 'Merriweather', 'Josefin Slab'] as const
export const LABEL_FONT_SIZES = [10, 12, 14, 16, 18, 20] as const
export const MEASUREMENT_UNITS = ['meters', 'kilometers', 'feet', 'miles'] as const
export const NUMBER_FORMATS = ['european', 'french', 'swiss', 'application'] as const

export type LabelFontFamily = typeof LABEL_FONT_FAMILIES[number]
export type LabelFontSize = typeof LABEL_FONT_SIZES[number]
export type MeasurementUnit = typeof MEASUREMENT_UNITS[number]
export type NumberFormat = typeof NUMBER_FORMATS[number]

export interface Config {
  allowMultiple: boolean
  showMapLabel: boolean
  lineColor: string
  lineWidth: number
  labelFontFamily: LabelFontFamily
  labelFontSize: LabelFontSize
  unit: MeasurementUnit
  numberFormat: NumberFormat
}

export type IMConfig = ImmutableObject<Config>

export function normalizeLabelFontFamily (value: unknown): LabelFontFamily {
  return LABEL_FONT_FAMILIES.find(font => font === value) ?? 'Arial'
}

export function normalizeLabelFontSize (value: unknown): LabelFontSize {
  const size = Number(value)
  return LABEL_FONT_SIZES.find(option => option === size) ?? 12
}

export function normalizeMeasurementUnit (value: unknown): MeasurementUnit {
  return MEASUREMENT_UNITS.find(option => option === value) ?? 'meters'
}

export function normalizeNumberFormat (value: unknown): NumberFormat {
  return NUMBER_FORMATS.find(option => option === value) ?? 'european'
}

export function convertMetersToUnit (meters: number, unit: MeasurementUnit): number {
  if (unit === 'kilometers') return meters / 1000
  if (unit === 'feet') return meters * 3.280839895
  if (unit === 'miles') return meters / 1609.344
  return meters
}

export function measurementFractionDigits (value: number, unit: MeasurementUnit): number {
  if (unit === 'kilometers' || unit === 'miles') {
    return value < 10 ? 2 : value < 100 ? 1 : 0
  }
  return value < 100 ? 1 : 0
}

export function formatMeasurementValue (
  value: number,
  numberFormat: NumberFormat,
  applicationLocale: string,
  fractionDigits: number
): string {
  const locale = numberFormat === 'european'
    ? 'de-DE'
    : numberFormat === 'french'
      ? 'fr-FR'
      : numberFormat === 'swiss'
        ? 'de-CH'
        : applicationLocale

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
    useGrouping: numberFormat !== 'european'
  }).format(value).replace(/\u202f/g, '\u00a0')
}
