import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'

import { createVuetify, ThemeDefinition } from 'vuetify'
import { VBtn } from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable } from 'vuetify/labs/VDataTable'

import { md3 } from 'vuetify/blueprints'
import { VTooltip } from 'v-tooltip'

// Material theme Colors: https://vuetifyjs.com/en/styles/colors/
const theme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#FAFAFA', // grey-lighten-5
    surface: '#FFFFFF', // white
    primary: '#2196F3', // blue
    secondary: '#4CAF50', // green
    default: '#757575', // grey-darken-1
    delete: '#F44336', // red
    error: '#B71C1C', // red-darken-4
    info: '#03A9F4', // light-blue
    success: '#66BB6A', // green-lighten-1
    warning: '#FFC107', // amber
  },
}

const textFieldAttrs = {
  density: 'comfortable',
  variant: 'outlined',
}

export default createVuetify({
  blueprint: md3,
  directives,
  aliases: {
    VBtnPrimary: VBtn,
    VBtnSecondary: VBtn,
    VBtnCancel: VBtn,
    VBtnDelete: VBtn,
    VBtnAdd: VBtn,
  },
  components: {
    VDataTable,
    VTooltip,
  },
  defaults: {
    VTextField: textFieldAttrs,
    VAutocomplete: textFieldAttrs,
    VTextarea: textFieldAttrs,
    VCheckbox: textFieldAttrs,
    VTable: {
      density: 'comfortable',
    },
    VCombobox: {
      variant: 'outlined',
    },
    VBtn: {
      color: 'primary',
      density: 'comfortable',
      rounded: false,
    },
    VBtnPrimary: {
      color: 'primary',
      density: 'comfortable',
    },
    VBtnSecondary: {
      color: 'secondary',
      density: 'comfortable',
    },
    VBtnDelete: {
      color: 'delete',
      density: 'comfortable',
    },
    VBtnCancel: {
      color: 'grey',
      density: 'comfortable',
    },
    VBtnAdd: {
      color: 'secondary',
      prependIcon: 'mdi-plus',
      rounded: true,
      density: 'comfortable',
      variant: 'elevated',
    },
  },
  theme: {
    defaultTheme: 'theme',
    themes: {
      theme,
    },
    variations: {
      colors: ['primary', 'secondary', 'surface'],
      lighten: 6,
      darken: 6,
    },
  },
})
