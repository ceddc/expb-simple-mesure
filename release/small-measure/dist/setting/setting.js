System.register(["jimu-core","jimu-ui/basic/color-picker","jimu-ui","jimu-ui/advanced/setting-components"],(function(e,t){var l={},i={},s={},a={};return{setters:[function(e){l.FormattedMessage=e.FormattedMessage,l.css=e.css,l.jsx=e.jsx},function(e){i.ColorPicker=e.ColorPicker},function(e){s.Option=e.Option,s.Select=e.Select,s.Switch=e.Switch},function(e){a.MapWidgetSelector=e.MapWidgetSelector,a.SettingRow=e.SettingRow,a.SettingSection=e.SettingSection}],execute:function(){e((()=>{var e={9244:e=>{"use strict";e.exports=l},4321:e=>{"use strict";e.exports=s},9298:e=>{"use strict";e.exports=a},4337:e=>{"use strict";e.exports=i}},t={};function n(l){var i=t[l];if(void 0!==i)return i.exports;var s=t[l]={exports:{}};return e[l](s,s.exports,n),s.exports}n.d=(e,t)=>{for(var l in t)n.o(t,l)&&!n.o(e,l)&&Object.defineProperty(e,l,{enumerable:!0,get:t[l]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.p="";var o={};return n.p=window.jimuConfig.baseUrl,(()=>{"use strict";n.r(o),n.d(o,{__set_webpack_public_path__:()=>S,default:()=>w});var e=n(9244),t=n(4337),l=n(4321),i=n(9298);const s=["Arial","Noto Sans","Merriweather","Josefin Slab"],a=[10,12,14,16,18,20],r=["meters","kilometers","feet","miles"],d=["european","french","swiss","application"];function u(e){var t;return null!==(t=s.find((t=>t===e)))&&void 0!==t?t:"Arial"}function m(e){var t;const l=Number(e);return null!==(t=a.find((e=>e===l)))&&void 0!==t?t:12}function c(e){var t;return null!==(t=r.find((t=>t===e)))&&void 0!==t?t:"meters"}function g(e){var t;return null!==(t=d.find((t=>t===e)))&&void 0!==t?t:"european"}function p(e,t){return"kilometers"===t?e/1e3:"feet"===t?3.280839895*e:"miles"===t?e/1609.344:e}function f(e,t,l,i){const s="european"===t?"de-DE":"french"===t?"fr-FR":"swiss"===t?"de-CH":l;return new Intl.NumberFormat(s,{maximumFractionDigits:i,minimumFractionDigits:i,useGrouping:"european"!==t}).format(e).replace(/\u202f/g,"\xa0")}const h={selectMap:"Map",measurement:"Measure",multipleMeasurements:"Multiple lines",showMapLabels:"Show label",unit:"Unit",unitMeters:"Meters",unitKilometers:"Kilometers",unitFeet:"Feet",unitMiles:"Miles",numberFormat:"Number format",numberFormatEuropean:"European",numberFormatFrench:"French",numberFormatSwiss:"Swiss",numberFormatApplication:"Application locale",lineStyle:"Line",lineColor:"Color",lineWidth:"Width",labelStyle:"Label",labelFont:"Font",labelSize:"Size",lengthMeters:"{value} m",lengthKilometers:"{value} km",lengthFeet:"{value} ft",lengthMiles:"{value} mi"},x={meters:"unitMeters",kilometers:"unitKilometers",feet:"unitFeet",miles:"unitMiles"},b={meters:"lengthMeters",kilometers:"lengthKilometers",feet:"lengthFeet",miles:"lengthMiles"},v={european:"numberFormatEuropean",french:"numberFormatFrench",swiss:"numberFormatSwiss",application:"numberFormatApplication"},M=1234567.8,j=()=>e.css`
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
`;function w(n){var o,w,S,F,y,N,C,k,z,W,O,$;const R=(e,t)=>{n.onSettingChange({id:n.id,config:n.config.set(e,t)})},_=null!==(w=null===(o=n.config)||void 0===o?void 0:o.lineColor)&&void 0!==w?w:"#0079c1",L=null!==(F=null===(S=n.config)||void 0===S?void 0:S.lineWidth)&&void 0!==F?F:3,P=u(null===(y=n.config)||void 0===y?void 0:y.labelFontFamily),A=m(null===(N=n.config)||void 0===N?void 0:N.labelFontSize),K=c(null===(C=n.config)||void 0===C?void 0:C.unit),E=g(null===(k=n.config)||void 0===k?void 0:k.numberFormat),I=`${n.id}-line-width`,T=`${n.id}-label-font`,D=`${n.id}-label-size`,U=`${n.id}-unit`,G=`${n.id}-number-format`,H=e=>{const t=b[K];return n.intl.formatMessage({id:t,defaultMessage:h[t]},{value:f(p(M,K),e,n.intl.locale,1)})},J=H(E);return(0,e.jsx)("div",{className:"small-measure-setting",css:j()},(0,e.jsx)(i.SettingSection,{title:n.intl.formatMessage({id:"selectMap",defaultMessage:h.selectMap})},(0,e.jsx)(i.SettingRow,null,(0,e.jsx)(i.MapWidgetSelector,{onSelect:e=>{n.onSettingChange({id:n.id,useMapWidgetIds:e})},useMapWidgetIds:n.useMapWidgetIds}))),(0,e.jsx)(i.SettingSection,{title:n.intl.formatMessage({id:"measurement",defaultMessage:h.measurement})},(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"setting-row-content"},(0,e.jsx)("label",{className:"setting-label",htmlFor:`${n.id}-allow-multiple`},(0,e.jsx)(e.FormattedMessage,{id:"multipleMeasurements",defaultMessage:h.multipleMeasurements})),(0,e.jsx)(l.Switch,{id:`${n.id}-allow-multiple`,checked:null!==(W=null===(z=n.config)||void 0===z?void 0:z.allowMultiple)&&void 0!==W&&W,onChange:e=>{R("allowMultiple",e.currentTarget.checked)}}))),(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"setting-row-content"},(0,e.jsx)("label",{className:"setting-label",htmlFor:`${n.id}-show-labels`},(0,e.jsx)(e.FormattedMessage,{id:"showMapLabels",defaultMessage:h.showMapLabels})),(0,e.jsx)(l.Switch,{id:`${n.id}-show-labels`,checked:null===($=null===(O=n.config)||void 0===O?void 0:O.showMapLabel)||void 0===$||$,onChange:e=>{R("showMapLabel",e.currentTarget.checked)}}))),(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"style-field format-field"},(0,e.jsx)("label",{className:"setting-label",htmlFor:U},(0,e.jsx)(e.FormattedMessage,{id:"unit",defaultMessage:h.unit})),(0,e.jsx)(l.Select,{id:U,className:"compact-select",size:"sm",value:K,onChange:(e,t)=>{R("unit",c(t))}},r.map((t=>{const i=x[t];return(0,e.jsx)(l.Option,{key:t,value:t},n.intl.formatMessage({id:i,defaultMessage:h[i]}))}))))),(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"style-field format-field"},(0,e.jsx)("label",{className:"setting-label",htmlFor:G},(0,e.jsx)(e.FormattedMessage,{id:"numberFormat",defaultMessage:h.numberFormat})),(0,e.jsx)(l.Select,{id:G,className:"compact-select",size:"sm",value:E,onChange:(e,t)=>{R("numberFormat",g(t))}},d.map((t=>{const i=v[t];return(0,e.jsx)(l.Option,{key:t,value:t},n.intl.formatMessage({id:i,defaultMessage:h[i]})," \u2014 ",H(t))})))))),(0,e.jsx)(i.SettingSection,{title:n.intl.formatMessage({id:"lineStyle",defaultMessage:h.lineStyle})},(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"style-grid"},(0,e.jsx)("div",{className:"style-field"},(0,e.jsx)("span",{className:"style-label"},(0,e.jsx)(e.FormattedMessage,{id:"lineColor",defaultMessage:h.lineColor})),(0,e.jsx)(t.ColorPicker,{"aria-label":n.intl.formatMessage({id:"lineColor",defaultMessage:h.lineColor}),color:_,onChange:e=>{R("lineColor",e)}})),(0,e.jsx)("div",{className:"style-field"},(0,e.jsx)("label",{className:"style-label",htmlFor:I},(0,e.jsx)(e.FormattedMessage,{id:"lineWidth",defaultMessage:h.lineWidth})),(0,e.jsx)("div",{className:"width-control"},(0,e.jsx)("span",{className:"width-preview","aria-hidden":"true"},(0,e.jsx)("span",{className:"width-preview-line",style:{height:`${L}px`,backgroundColor:_}})),(0,e.jsx)(l.Select,{id:I,className:"width-select",size:"sm","aria-label":n.intl.formatMessage({id:"lineWidth",defaultMessage:h.lineWidth}),value:L,onChange:(e,t)=>{R("lineWidth",Number(t))}},[2,3,4,5,6].map((t=>(0,e.jsx)(l.Option,{key:t,value:t},n.intl.formatNumber(t)," px"))))))))),(0,e.jsx)(i.SettingSection,{title:n.intl.formatMessage({id:"labelStyle",defaultMessage:h.labelStyle})},(0,e.jsx)(i.SettingRow,null,(0,e.jsx)("div",{className:"style-grid"},(0,e.jsx)("div",{className:"style-field"},(0,e.jsx)("label",{className:"style-label",htmlFor:T},(0,e.jsx)(e.FormattedMessage,{id:"labelFont",defaultMessage:h.labelFont})),(0,e.jsx)(l.Select,{id:T,className:"compact-select",size:"sm",value:P,onChange:(e,t)=>{R("labelFontFamily",u(t))}},s.map((t=>(0,e.jsx)(l.Option,{key:t,value:t},t))))),(0,e.jsx)("div",{className:"style-field"},(0,e.jsx)("label",{className:"style-label",htmlFor:D},(0,e.jsx)(e.FormattedMessage,{id:"labelSize",defaultMessage:h.labelSize})),(0,e.jsx)(l.Select,{id:D,className:"compact-select",size:"sm",value:A,onChange:(e,t)=>{R("labelFontSize",m(t))}},a.map((t=>(0,e.jsx)(l.Option,{key:t,value:t},n.intl.formatNumber(t)," pt"))))),(0,e.jsx)("div",{className:"label-preview","aria-hidden":"true",style:{fontFamily:P,fontSize:`${A}pt`}},J)))))}function S(e){n.p=e}})(),o})())}}}));