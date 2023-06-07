import { defineConfig } from 'cypress'

const host = Cypress.env('VUE_APP_HOST');

export default defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    baseUrl: `http://${host}:5173`
  }
})
