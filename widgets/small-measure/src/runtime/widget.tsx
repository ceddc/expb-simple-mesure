/** @jsx jsx */
import { AppMode, React, css, jsx } from 'jimu-core'
import { Button, ButtonGroup, Tooltip } from 'jimu-ui'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { MeasureOutlined } from 'jimu-icons/outlined/gis/measure'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import Graphic from 'esri/Graphic'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import * as geodeticLengthOperator from 'esri/geometry/operators/geodeticLengthOperator'
import type { AllWidgetProps } from 'jimu-core'
import {
  convertMetersToUnit,
  formatMeasurementValue,
  measurementFractionDigits,
  normalizeLabelFontFamily,
  normalizeLabelFontSize,
  normalizeMeasurementUnit,
  normalizeNumberFormat
} from '../config'
import type { Config, IMConfig, MeasurementUnit } from '../config'
import defaultMessages from './translations/default'

const UNIT_VALUE_MESSAGE_IDS: Record<MeasurementUnit, keyof typeof defaultMessages> = {
  meters: 'lengthMeters',
  kilometers: 'lengthKilometers',
  feet: 'lengthFeet',
  miles: 'lengthMiles'
}

interface RemovableHandle {
  remove: () => void
}

interface RuntimeResources {
  jimuMapView: JimuMapView
  measureLayer: GraphicsLayer
  labelLayer: GraphicsLayer
  sketch: SketchViewModel
  handles: RemovableHandle[]
  labels: Map<Graphic, Graphic>
  activeGraphic: Graphic | null
  isDrawing: boolean
}

const DEFAULT_CONFIG: Config = {
  allowMultiple: false,
  showMapLabel: true,
  lineColor: '#0079c1',
  lineWidth: 3,
  labelFontFamily: 'Arial',
  labelFontSize: 12,
  unit: 'meters',
  numberFormat: 'european'
}

const LABEL_OFFSET = 28

const getStyle = () => css`
  width: 100%;
  height: 100%;
  min-width: 64px;
  min-height: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: visible;

  .measure-tools {
    width: 64px;
    height: 32px;
    flex: 0 0 64px;
    box-shadow: 0 1px 2px rgb(0 0 0 / 30%);
  }

  .measure-tooltip-target {
    width: 32px;
    height: 32px;
    display: inline-flex;
  }

  .measure-tool-button {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0;
    border-radius: 0;
  }

  .measure-tool-button svg {
    width: 18px;
    height: 18px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

function normalizeConfig (config: IMConfig): Config {
  return {
    allowMultiple: config?.allowMultiple ?? DEFAULT_CONFIG.allowMultiple,
    showMapLabel: config?.showMapLabel ?? DEFAULT_CONFIG.showMapLabel,
    lineColor: config?.lineColor ?? DEFAULT_CONFIG.lineColor,
    lineWidth: config?.lineWidth ?? DEFAULT_CONFIG.lineWidth,
    labelFontFamily: normalizeLabelFontFamily(config?.labelFontFamily),
    labelFontSize: normalizeLabelFontSize(config?.labelFontSize),
    unit: normalizeMeasurementUnit(config?.unit),
    numberFormat: normalizeNumberFormat(config?.numberFormat)
  }
}

function buildUpdateOptions (): __esri.SketchViewModelDefaultUpdateOptions {
  return {
    tool: 'reshape',
    toggleToolOnClick: false,
    highlightOptions: {
      enabled: false
    }
  }
}

function lineSymbol (config: Config): __esri.SimpleLineSymbolProperties {
  return {
    type: 'simple-line',
    color: config.lineColor,
    width: config.lineWidth
  }
}

function labelSymbol (text: string, config: Config): __esri.TextSymbolProperties {
  return {
    type: 'text',
    text,
    color: '#17202a',
    haloColor: '#ffffff',
    haloSize: 1.5,
    horizontalAlignment: 'center',
    verticalAlignment: 'bottom',
    yoffset: LABEL_OFFSET,
    font: {
      family: config.labelFontFamily,
      size: config.labelFontSize,
      weight: 'bold'
    }
  }
}

export default function Widget (props: AllWidgetProps<IMConfig>) {
  const initialConfig = normalizeConfig(props.config)
  const formatDistanceValue = (meters: number, activeConfig: Config, intl: typeof props.intl) => {
    const unit = activeConfig.unit
    const value = convertMetersToUnit(Math.abs(meters), unit)
    const valueText = formatMeasurementValue(
      value,
      activeConfig.numberFormat,
      intl.locale,
      measurementFractionDigits(value, unit)
    )
    const messageId = UNIT_VALUE_MESSAGE_IDS[unit]

    return intl.formatMessage({
      id: messageId,
      defaultMessage: defaultMessages[messageId]
    }, { value: valueText })
  }
  const [jimuMapView, setJimuMapView] = React.useState<JimuMapView | null>(null)
  const [isReady, setIsReady] = React.useState(false)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasMeasurement, setHasMeasurement] = React.useState(false)
  const [lengthText, setLengthText] = React.useState(() => formatDistanceValue(0, initialConfig, props.intl))
  const [statusText, setStatusText] = React.useState(
    props.intl.formatMessage({ id: 'ready', defaultMessage: defaultMessages.ready })
  )
  const resourcesRef = React.useRef<RuntimeResources | null>(null)
  const configRef = React.useRef<Config>(normalizeConfig(props.config))
  const appModeRef = React.useRef(props.appMode)
  const intlRef = React.useRef(props.intl)

  const config = normalizeConfig(props.config)
  configRef.current = config
  appModeRef.current = props.appMode
  intlRef.current = props.intl

  const syncAvailability = (resources: RuntimeResources) => {
    setHasMeasurement(resources.measureLayer.graphics.length > 0)
  }

  const removeLabel = (resources: RuntimeResources, graphic: Graphic) => {
    const label = resources.labels.get(graphic)
    if (label) {
      resources.labelLayer.remove(label)
      resources.labels.delete(graphic)
    }
  }

  const formatDistance = (meters: number) => formatDistanceValue(
    meters,
    configRef.current,
    intlRef.current
  )

  const updateMeasurement = (resources: RuntimeResources, graphic: Graphic) => {
    const geometry = graphic?.geometry
    if (!geometry || geometry.type !== 'polyline') {
      removeLabel(resources, graphic)
      setLengthText(formatDistance(0))
      setStatusText(intlRef.current.formatMessage({
        id: resources.isDrawing ? 'drawStart' : 'ready',
        defaultMessage: resources.isDrawing ? defaultMessages.drawStart : defaultMessages.ready
      }))
      syncAvailability(resources)
      return
    }

    const polyline = geometry as __esri.Polyline
    if (polyline.paths[0]?.length < 2) {
      removeLabel(resources, graphic)
      setLengthText(formatDistance(0))
      syncAvailability(resources)
      return
    }

    const meters = geodeticLengthOperator.execute(polyline, { unit: 'meters' })
    const text = formatDistance(meters)
    const activeConfig = configRef.current

    if (activeConfig.showMapLabel) {
      let label = resources.labels.get(graphic)
      if (!label) {
        label = new Graphic({ symbol: labelSymbol('', activeConfig) })
        resources.labels.set(graphic, label)
        resources.labelLayer.add(label)
      }

      label.geometry = polyline.extent.center
      label.symbol = labelSymbol(text, activeConfig)
    } else {
      removeLabel(resources, graphic)
    }

    setLengthText(text)
    setStatusText(intlRef.current.formatMessage({
      id: resources.isDrawing ? 'drawContinue' : 'ready',
      defaultMessage: resources.isDrawing ? defaultMessages.drawContinue : defaultMessages.ready
    }))
    syncAvailability(resources)
  }

  const activateUpdate = (resources: RuntimeResources, graphic: Graphic) => {
    if (!graphic?.geometry) return

    void resources.sketch
      .update(graphic, buildUpdateOptions())
      .catch(() => {})
  }

  const selectLastMeasurement = (resources: RuntimeResources) => {
    const count = resources.measureLayer.graphics.length
    if (count === 0) {
      resources.activeGraphic = null
      setLengthText(formatDistance(0))
      setStatusText(intlRef.current.formatMessage({ id: 'ready', defaultMessage: defaultMessages.ready }))
      syncAvailability(resources)
      return
    }

    const graphic = resources.measureLayer.graphics.getItemAt(count - 1)
    resources.activeGraphic = graphic
    updateMeasurement(resources, graphic)
    activateUpdate(resources, graphic)
  }

  const clearMeasurements = (resources: RuntimeResources) => {
    resources.sketch.cancel()
    resources.measureLayer.removeAll()
    resources.labelLayer.removeAll()
    resources.labels.clear()
    resources.activeGraphic = null
    resources.isDrawing = false
    setIsDrawing(false)
    setLengthText(formatDistance(0))
    setStatusText(intlRef.current.formatMessage({ id: 'ready', defaultMessage: defaultMessages.ready }))
    syncAvailability(resources)
  }

  const deleteActiveMeasurement = (resources: RuntimeResources) => {
    if (!resources.activeGraphic && resources.measureLayer.graphics.length > 0) {
      resources.activeGraphic = resources.measureLayer.graphics.getItemAt(
        resources.measureLayer.graphics.length - 1
      )
    }

    if (!resources.activeGraphic) return

    const graphic = resources.activeGraphic
    resources.sketch.cancel()
    removeLabel(resources, graphic)
    resources.measureLayer.remove(graphic)
    resources.activeGraphic = null
    selectLastMeasurement(resources)
  }

  const startMeasurement = () => {
    const resources = resourcesRef.current
    if (!resources || props.appMode === AppMode.Design) return

    resources.sketch.cancel()
    if (!configRef.current.allowMultiple) {
      clearMeasurements(resources)
    }

    resources.isDrawing = true
    resources.activeGraphic = null
    setIsDrawing(true)
    setStatusText(intlRef.current.formatMessage({ id: 'drawStart', defaultMessage: defaultMessages.drawStart }))
    resources.sketch.create('polyline', { mode: 'click' })
  }

  React.useEffect(() => {
    const resources = resourcesRef.current
    if (!resources) {
      setLengthText(formatDistance(0))
      return
    }

    resources.sketch.defaultUpdateOptions = buildUpdateOptions()
    resources.sketch.polylineSymbol = lineSymbol(config)
    resources.measureLayer.graphics.forEach(graphic => {
      graphic.symbol = lineSymbol(config)
    })

    resources.labelLayer.removeAll()
    resources.labels.clear()
    resources.measureLayer.graphics.forEach(graphic => {
      updateMeasurement(resources, graphic)
    })
    if (resources.measureLayer.graphics.length === 0) {
      setLengthText(formatDistance(0))
      setStatusText(intlRef.current.formatMessage({
        id: resources.isDrawing ? 'drawStart' : 'ready',
        defaultMessage: resources.isDrawing ? defaultMessages.drawStart : defaultMessages.ready
      }))
    }
  }, [
    config.allowMultiple,
    config.labelFontFamily,
    config.labelFontSize,
    config.lineColor,
    config.lineWidth,
    config.numberFormat,
    config.showMapLabel,
    config.unit,
    props.intl.locale
  ])

  React.useEffect(() => {
    if (!jimuMapView?.view) return

    let cancelled = false
    setIsReady(false)
    setIsDrawing(false)
    setHasMeasurement(false)

    const setup = async () => {
      if (!geodeticLengthOperator.isLoaded()) {
        await geodeticLengthOperator.load()
      }
      if (cancelled) return

      const measureLayer = new GraphicsLayer({
        id: `${props.id}-measure-lines`,
        listMode: 'hide'
      })
      const labelLayer = new GraphicsLayer({
        id: `${props.id}-measure-labels`,
        listMode: 'hide'
      })
      jimuMapView.view.map.addMany([measureLayer, labelLayer])

      const sketch = new SketchViewModel({
        view: jimuMapView.view,
        layer: measureLayer,
        defaultCreateOptions: { mode: 'click' },
        defaultUpdateOptions: buildUpdateOptions(),
        polylineSymbol: lineSymbol(configRef.current)
      })

      const resources: RuntimeResources = {
        jimuMapView,
        measureLayer,
        labelLayer,
        sketch,
        handles: [],
        labels: new Map(),
        activeGraphic: null,
        isDrawing: false
      }

      resources.handles.push(
        sketch.on('create', event => {
          resources.activeGraphic = event.graphic
          updateMeasurement(resources, event.graphic)

          if (event.state === 'complete') {
            resources.isDrawing = false
            setIsDrawing(false)
            activateUpdate(resources, event.graphic)
            updateMeasurement(resources, event.graphic)
          } else if (event.state === 'cancel') {
            resources.isDrawing = false
            setIsDrawing(false)
            selectLastMeasurement(resources)
          }
        }),
        sketch.on('update', event => {
          const graphic = event.graphics?.[0]
          if (graphic) {
            resources.activeGraphic = graphic
            updateMeasurement(resources, graphic)
          }
        }),
        sketch.on('delete', event => {
          event.graphics?.forEach(graphic => { removeLabel(resources, graphic) })
          resources.activeGraphic = null
          selectLastMeasurement(resources)
        })
      )

      const handleDocumentKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Delete' || appModeRef.current === AppMode.Design) return

        const target = event.target as HTMLElement
        const isEditingField = target?.isContentEditable ||
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement

        if (isEditingField || resources.measureLayer.graphics.length === 0) return

        event.preventDefault()
        event.stopPropagation()
        deleteActiveMeasurement(resources)
      }

      document.addEventListener('keydown', handleDocumentKeyDown, true)
      resources.handles.push({
        remove: () => { document.removeEventListener('keydown', handleDocumentKeyDown, true) }
      })

      resourcesRef.current = resources
      setIsReady(true)
      setStatusText(intlRef.current.formatMessage({ id: 'ready', defaultMessage: defaultMessages.ready }))
    }

    void setup()

    return () => {
      cancelled = true
      const resources = resourcesRef.current
      if (!resources || resources.jimuMapView !== jimuMapView) return

      resources.handles.forEach(handle => { handle.remove() })
      resources.sketch.cancel()
      resources.sketch.destroy()
      resources.jimuMapView.view.map.removeMany([
        resources.measureLayer,
        resources.labelLayer
      ])
      resourcesRef.current = null
    }
  }, [jimuMapView])

  const onActiveViewChange = (nextJimuMapView: JimuMapView) => {
    setJimuMapView(nextJimuMapView)
  }

  const mapWidgetId = props.useMapWidgetIds?.[0]
  const interactionDisabled = !isReady || props.appMode === AppMode.Design
  const measureLabel = props.intl.formatMessage({
    id: 'measureDistance',
    defaultMessage: defaultMessages.measureDistance
  })
  const deleteLabel = props.intl.formatMessage({
    id: 'deleteMeasurement',
    defaultMessage: defaultMessages.deleteMeasurement
  })
  const toolsLabel = props.intl.formatMessage({
    id: 'measurementTools',
    defaultMessage: defaultMessages.measurementTools
  })

  return (
    <div className='jimu-widget small-measure-widget' css={getStyle()}>
      <ButtonGroup
        className='measure-tools'
        size='sm'
        variant='contained'
        color='default'
        aria-label={toolsLabel}
      >
        <Tooltip title={measureLabel} placement='bottom'>
          <span className='measure-tooltip-target'>
            <Button
              className='measure-tool-button'
              icon
              active={isDrawing}
              color={isDrawing ? 'primary' : 'default'}
              aria-label={measureLabel}
              aria-pressed={isDrawing}
              disabled={interactionDisabled}
              onClick={startMeasurement}
            >
              <MeasureOutlined />
            </Button>
          </span>
        </Tooltip>

        <Tooltip title={deleteLabel} placement='bottom'>
          <span className='measure-tooltip-target'>
            <Button
              className='measure-tool-button'
              icon
              aria-label={deleteLabel}
              aria-keyshortcuts='Delete'
              disabled={interactionDisabled || !hasMeasurement}
              onClick={() => {
                const resources = resourcesRef.current
                if (resources) deleteActiveMeasurement(resources)
              }}
            >
              <TrashOutlined />
            </Button>
          </span>
        </Tooltip>
      </ButtonGroup>

      {mapWidgetId && (
        <JimuMapViewComponent
          key={mapWidgetId}
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      <span className='sr-only' role='status' aria-live='polite' aria-atomic='true'>
        {statusText}. {lengthText}
      </span>
    </div>
  )
}
