/** @jsx jsx */
import { FormattedMessage, React, css, jsx } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { ColorPicker } from 'jimu-ui/basic/color-picker'
import { Option, Select, Switch } from 'jimu-ui'
import {
  MapWidgetSelector,
  SettingRow,
  SettingSection
} from 'jimu-ui/advanced/setting-components'
import {
  LABEL_FONT_FAMILIES,
  LABEL_FONT_SIZES,
  MEASUREMENT_UNITS,
  NUMBER_FORMATS,
  convertMetersToUnit,
  formatMeasurementValue,
  normalizeLabelFontFamily,
  normalizeLabelFontSize,
  normalizeMeasurementUnit,
  normalizeNumberFormat
} from '../config'
import type { Config, IMConfig, MeasurementUnit, NumberFormat } from '../config'
import defaultMessages from './translations/default'

const UNIT_MESSAGE_IDS: Record<MeasurementUnit, keyof typeof defaultMessages> = {
  meters: 'unitMeters',
  kilometers: 'unitKilometers',
  feet: 'unitFeet',
  miles: 'unitMiles'
}

const UNIT_VALUE_MESSAGE_IDS: Record<MeasurementUnit, keyof typeof defaultMessages> = {
  meters: 'lengthMeters',
  kilometers: 'lengthKilometers',
  feet: 'lengthFeet',
  miles: 'lengthMiles'
}

const NUMBER_FORMAT_MESSAGE_IDS: Record<NumberFormat, keyof typeof defaultMessages> = {
  european: 'numberFormatEuropean',
  french: 'numberFormatFrench',
  swiss: 'numberFormatSwiss',
  application: 'numberFormatApplication'
}

const NUMBER_FORMAT_PREVIEW_VALUE = 1234567.8

const getStyle = () => css`
  .setting-row-content {
    width: 100%;
    min-height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .setting-label {
    min-width: 0;
    font-size: 13px;
    line-height: 1.3;
  }

  .style-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .style-field {
    min-width: 0;
    display: grid;
    gap: 6px;
  }

  .style-label {
    color: var(--ref-palette-neutral-1100);
    font-size: 12px;
    line-height: 1.3;
  }

  .width-control {
    min-width: 0;
    height: 28px;
    display: grid;
    grid-template-columns: minmax(34px, 1fr) 64px;
    align-items: center;
    border: 1px solid var(--ref-palette-neutral-700);
    background: var(--ref-palette-white);
  }

  .width-preview {
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 7px;
  }

  .width-preview-line {
    width: 100%;
    display: block;
    border-radius: 1px;
  }

  .width-select {
    min-width: 64px;
    border-left: 1px solid var(--ref-palette-neutral-500);
  }

  .compact-select {
    width: 100%;
    min-width: 0;
  }

  .format-field {
    width: 100%;
  }

  .label-preview {
    min-height: 38px;
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--ref-palette-neutral-500);
    background: var(--ref-palette-neutral-200);
    color: var(--ref-palette-neutral-1100);
    line-height: 1;
  }
`

export default function Setting (props: AllWidgetSettingProps<IMConfig>) {
  const updateConfig = <K extends keyof Config>(key: K, value: Config[K]) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set(key, value)
    })
  }

  const onMapSelected = (useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds
    })
  }

  const lineColor = props.config?.lineColor ?? '#0079c1'
  const lineWidth = props.config?.lineWidth ?? 3
  const labelFontFamily = normalizeLabelFontFamily(props.config?.labelFontFamily)
  const labelFontSize = normalizeLabelFontSize(props.config?.labelFontSize)
  const unit = normalizeMeasurementUnit(props.config?.unit)
  const numberFormat = normalizeNumberFormat(props.config?.numberFormat)
  const widthSelectId = `${props.id}-line-width`
  const fontSelectId = `${props.id}-label-font`
  const sizeSelectId = `${props.id}-label-size`
  const unitSelectId = `${props.id}-unit`
  const numberFormatSelectId = `${props.id}-number-format`
  const formatPreview = (format: NumberFormat) => {
    const valueMessageId = UNIT_VALUE_MESSAGE_IDS[unit]
    return props.intl.formatMessage({
      id: valueMessageId,
      defaultMessage: defaultMessages[valueMessageId]
    }, {
      value: formatMeasurementValue(
        convertMetersToUnit(NUMBER_FORMAT_PREVIEW_VALUE, unit),
        format,
        props.intl.locale,
        1
      )
    })
  }
  const labelPreviewText = formatPreview(numberFormat)

  return (
    <div className='small-measure-setting' css={getStyle()}>
      <SettingSection
        title={props.intl.formatMessage({
          id: 'selectMap',
          defaultMessage: defaultMessages.selectMap
        })}
      >
        <SettingRow>
          <MapWidgetSelector
            onSelect={onMapSelected}
            useMapWidgetIds={props.useMapWidgetIds}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection
        title={props.intl.formatMessage({
          id: 'measurement',
          defaultMessage: defaultMessages.measurement
        })}
      >
        <SettingRow>
          <div className='setting-row-content'>
            <label className='setting-label' htmlFor={`${props.id}-allow-multiple`}>
              <FormattedMessage
                id='multipleMeasurements'
                defaultMessage={defaultMessages.multipleMeasurements}
              />
            </label>
            <Switch
              id={`${props.id}-allow-multiple`}
              checked={props.config?.allowMultiple ?? false}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                updateConfig('allowMultiple', event.currentTarget.checked)
              }}
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className='setting-row-content'>
            <label className='setting-label' htmlFor={`${props.id}-show-labels`}>
              <FormattedMessage
                id='showMapLabels'
                defaultMessage={defaultMessages.showMapLabels}
              />
            </label>
            <Switch
              id={`${props.id}-show-labels`}
              checked={props.config?.showMapLabel ?? true}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                updateConfig('showMapLabel', event.currentTarget.checked)
              }}
            />
          </div>
        </SettingRow>

        <SettingRow>
          <div className='style-field format-field'>
            <label className='setting-label' htmlFor={unitSelectId}>
              <FormattedMessage
                id='unit'
                defaultMessage={defaultMessages.unit}
              />
            </label>
            <Select
              id={unitSelectId}
              className='compact-select'
              size='sm'
              value={unit}
              onChange={(_event, value) => {
                updateConfig('unit', normalizeMeasurementUnit(value))
              }}
            >
              {MEASUREMENT_UNITS.map(option => {
                const messageId = UNIT_MESSAGE_IDS[option]
                return (
                  <Option key={option} value={option}>
                    {props.intl.formatMessage({
                      id: messageId,
                      defaultMessage: defaultMessages[messageId]
                    })}
                  </Option>
                )
              })}
            </Select>
          </div>
        </SettingRow>

        <SettingRow>
          <div className='style-field format-field'>
            <label className='setting-label' htmlFor={numberFormatSelectId}>
              <FormattedMessage
                id='numberFormat'
                defaultMessage={defaultMessages.numberFormat}
              />
            </label>
            <Select
              id={numberFormatSelectId}
              className='compact-select'
              size='sm'
              value={numberFormat}
              onChange={(_event, value) => {
                updateConfig('numberFormat', normalizeNumberFormat(value))
              }}
            >
              {NUMBER_FORMATS.map(format => {
                const messageId = NUMBER_FORMAT_MESSAGE_IDS[format]
                return (
                  <Option key={format} value={format}>
                    {props.intl.formatMessage({
                      id: messageId,
                      defaultMessage: defaultMessages[messageId]
                    })} — {formatPreview(format)}
                  </Option>
                )
              })}
            </Select>
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection
        title={props.intl.formatMessage({
          id: 'lineStyle',
          defaultMessage: defaultMessages.lineStyle
        })}
      >
        <SettingRow>
          <div className='style-grid'>
            <div className='style-field'>
              <span className='style-label'>
                <FormattedMessage id='lineColor' defaultMessage={defaultMessages.lineColor} />
              </span>
              <ColorPicker
                aria-label={props.intl.formatMessage({
                  id: 'lineColor',
                  defaultMessage: defaultMessages.lineColor
                })}
                color={lineColor}
                onChange={(color) => { updateConfig('lineColor', color) }}
              />
            </div>

            <div className='style-field'>
              <label className='style-label' htmlFor={widthSelectId}>
                <FormattedMessage id='lineWidth' defaultMessage={defaultMessages.lineWidth} />
              </label>
              <div className='width-control'>
                <span className='width-preview' aria-hidden='true'>
                  <span
                    className='width-preview-line'
                    style={{
                      height: `${lineWidth}px`,
                      backgroundColor: lineColor
                    }}
                  />
                </span>
                <Select
                  id={widthSelectId}
                  className='width-select'
                  size='sm'
                  aria-label={props.intl.formatMessage({
                    id: 'lineWidth',
                    defaultMessage: defaultMessages.lineWidth
                  })}
                  value={lineWidth}
                  onChange={(_event, value) => {
                    updateConfig('lineWidth', Number(value))
                  }}
                >
                  {[2, 3, 4, 5, 6].map(width => (
                    <Option key={width} value={width}>
                      {props.intl.formatNumber(width)} px
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection
        title={props.intl.formatMessage({
          id: 'labelStyle',
          defaultMessage: defaultMessages.labelStyle
        })}
      >
        <SettingRow>
          <div className='style-grid'>
            <div className='style-field'>
              <label className='style-label' htmlFor={fontSelectId}>
                <FormattedMessage id='labelFont' defaultMessage={defaultMessages.labelFont} />
              </label>
              <Select
                id={fontSelectId}
                className='compact-select'
                size='sm'
                value={labelFontFamily}
                onChange={(_event, value) => {
                  updateConfig('labelFontFamily', normalizeLabelFontFamily(value))
                }}
              >
                {LABEL_FONT_FAMILIES.map(font => (
                  <Option key={font} value={font}>{font}</Option>
                ))}
              </Select>
            </div>

            <div className='style-field'>
              <label className='style-label' htmlFor={sizeSelectId}>
                <FormattedMessage id='labelSize' defaultMessage={defaultMessages.labelSize} />
              </label>
              <Select
                id={sizeSelectId}
                className='compact-select'
                size='sm'
                value={labelFontSize}
                onChange={(_event, value) => {
                  updateConfig('labelFontSize', normalizeLabelFontSize(value))
                }}
              >
                {LABEL_FONT_SIZES.map(size => (
                  <Option key={size} value={size}>
                    {props.intl.formatNumber(size)} pt
                  </Option>
                ))}
              </Select>
            </div>

            <div
              className='label-preview'
              aria-hidden='true'
              style={{
                fontFamily: labelFontFamily,
                fontSize: `${labelFontSize}pt`
              }}
            >
              {labelPreviewText}
            </div>
          </div>
        </SettingRow>
      </SettingSection>
    </div>
  )
}
