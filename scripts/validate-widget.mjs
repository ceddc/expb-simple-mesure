import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const supportedLocales = ['en', 'fr', 'de', 'es', 'it', 'pt-br', 'nl', 'pl', 'cs', 'da', 'sv', 'nb', 'fi']
const additionalLocales = supportedLocales.filter(locale => locale !== 'en')
const runtimeMessageKeys = ['_widgetLabel', 'measurementTools', 'measureDistance', 'deleteMeasurement', 'ready', 'drawStart', 'drawContinue', 'lengthMeters', 'lengthKilometers', 'lengthFeet', 'lengthMiles']
const settingMessageKeys = ['selectMap', 'measurement', 'multipleMeasurements', 'showMapLabels', 'unit', 'unitMeters', 'unitKilometers', 'unitFeet', 'unitMiles', 'numberFormat', 'numberFormatEuropean', 'numberFormatFrench', 'numberFormatSwiss', 'numberFormatApplication', 'lineStyle', 'lineColor', 'lineWidth', 'labelStyle', 'labelFont', 'labelSize', 'lengthMeters', 'lengthKilometers', 'lengthFeet', 'lengthMiles']
const translationTargets = [
  { relativePath: 'widgets/small-measure/src/runtime/translations', keys: runtimeMessageKeys },
  { relativePath: 'widgets/small-measure/src/setting/translations', keys: settingMessageKeys },
  { relativePath: 'release/small-measure/dist/runtime/translations', keys: runtimeMessageKeys },
  { relativePath: 'release/small-measure/dist/setting/translations', keys: settingMessageKeys }
]
const expectedTranslationFiles = ['default.ts', ...additionalLocales.map(locale => `${locale}.js`)].sort()

function assert (condition, message) {
  if (!condition) throw new Error(message)
}

async function readJson (relativePath) {
  const contents = await readFile(path.join(projectRoot, relativePath), 'utf8')
  return JSON.parse(contents)
}

const widgetsRoot = path.join(projectRoot, 'widgets')
const widgetEntries = (await readdir(widgetsRoot, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())

assert(widgetEntries.length === 1, `Expected one widget folder, found ${widgetEntries.length}.`)
assert(widgetEntries[0].name === 'small-measure', `Expected small-measure, found ${widgetEntries[0].name}.`)

const requiredFiles = [
  'widgets/small-measure/config.json',
  'widgets/small-measure/icon.svg',
  'widgets/small-measure/manifest.json',
  'widgets/small-measure/src/config.ts',
  'widgets/small-measure/src/runtime/widget.tsx',
  'widgets/small-measure/src/runtime/translations/default.ts',
  'widgets/small-measure/src/setting/setting.tsx',
  'widgets/small-measure/src/setting/translations/default.ts',
  'release/small-measure/LICENSE',
  'release/small-measure/config.json',
  'release/small-measure/icon.svg',
  'release/small-measure/manifest.json',
  'release/small-measure/dist/runtime/widget.js',
  'release/small-measure/dist/setting/setting.js'
]

for (const relativePath of requiredFiles) {
  await readFile(path.join(projectRoot, relativePath))
}

for (const target of translationTargets) {
  const translationRoot = path.join(projectRoot, target.relativePath)
  const actualFiles = (await readdir(translationRoot)).sort()
  assert(
    JSON.stringify(actualFiles) === JSON.stringify(expectedTranslationFiles),
    `${target.relativePath} must contain default.ts and only the ${additionalLocales.length} additional locale JavaScript files.`
  )

  for (const fileName of expectedTranslationFiles) {
    const messages = await readFile(path.join(translationRoot, fileName), 'utf8')
    for (const key of target.keys) {
      assert(messages.includes(`${key}:`), `${target.relativePath}/${fileName} is missing ${key}.`)
    }
  }
}

const repositoryManifest = await readJson('manifest.json')
assert(repositoryManifest.type === 'exb-web-extension-repo', 'The root manifest is not an Experience Builder extension repository.')
assert(repositoryManifest.license.includes('opensource.org/license/mit'), 'The root manifest must reference the MIT License.')

const widgetManifest = await readJson('widgets/small-measure/manifest.json')
assert(widgetManifest.name === 'small-measure', 'The widget manifest name must match its folder.')
assert(widgetManifest.type === 'widget', 'The Small Measure manifest type must be widget.')
assert(widgetManifest.version === '1.17.0', 'The widget version must remain 1.17.0 for this release.')
assert(widgetManifest.exbVersion === '1.17.0', 'The Experience Builder version must remain 1.17.0 for this release.')
assert(widgetManifest.dependency === 'jimu-arcgis', 'The runtime map dependency is missing.')
assert(widgetManifest.settingDependency === 'jimu-arcgis', 'The settings map dependency is missing.')
assert(JSON.stringify(widgetManifest.translatedLocales) === JSON.stringify(supportedLocales), 'English must remain the default and all supported locales must be declared in order.')
assert(widgetManifest.license.includes('opensource.org/license/mit'), 'The widget manifest must reference the MIT License.')

const config = await readJson('widgets/small-measure/config.json')
assert(config.allowMultiple === false, 'The default must allow one measurement at a time.')
assert(config.showMapLabel === true, 'Map labels must be enabled by default.')
assert(config.unit === 'meters', 'Meters must be the default measurement unit.')
assert(config.numberFormat === 'european', 'European number formatting must be enabled by default.')

const releaseManifest = await readJson('release/small-measure/manifest.json')
const releaseConfig = await readJson('release/small-measure/config.json')
const sourceIcon = await readFile(path.join(projectRoot, 'widgets/small-measure/icon.svg'), 'utf8')
const releaseIcon = await readFile(path.join(projectRoot, 'release/small-measure/icon.svg'), 'utf8')
const sourceLicense = await readFile(path.join(projectRoot, 'LICENSE'), 'utf8')
const releaseLicense = await readFile(path.join(projectRoot, 'release/small-measure/LICENSE'), 'utf8')
const releaseRuntime = await readFile(path.join(projectRoot, 'release/small-measure/dist/runtime/widget.js'), 'utf8')
const releaseSetting = await readFile(path.join(projectRoot, 'release/small-measure/dist/setting/setting.js'), 'utf8')
assert(JSON.stringify(releaseManifest) === JSON.stringify(widgetManifest), 'The ready-to-host manifest must match the source widget.')
assert(JSON.stringify(releaseConfig) === JSON.stringify(config), 'The ready-to-host configuration must match the source widget.')
assert(releaseIcon === sourceIcon, 'The ready-to-host icon must match the source widget.')
assert(releaseLicense === sourceLicense, 'The ready-to-host license must match the repository license.')
assert(releaseConfig.unit === 'meters', 'The ready-to-host widget must default to meters.')
for (const unit of ['meters', 'kilometers', 'feet', 'miles']) {
  assert(releaseRuntime.includes(unit), `The ready-to-host runtime is missing the ${unit} unit.`)
  assert(releaseSetting.includes(unit), `The ready-to-host settings are missing the ${unit} unit.`)
}

console.log(`Validated one Small Measure widget, a ready-to-host release, meters by default, European number formatting, Experience Builder 1.17 metadata, MIT licensing, and ${supportedLocales.length} complete locales.`)
