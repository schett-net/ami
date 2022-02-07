import theme from '../src/theme/theme'

export const parameters = {
  actions: {argTypesRegex: '^on[A-Z].*'},
  layout: 'fullscreen',
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/
    }
  },
  chakra: {
    theme
  }
}

export const decorators = [Story => <Story />]
