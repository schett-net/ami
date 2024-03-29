module.exports = {
  stories: [
    '../src/**/*.stories.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@snek-at/storybook-addon-chakra-ui'
  ],
  core: {
    builder: 'webpack5'
  },
  framework: '@storybook/react',
  webpackFinal: async (config, {presets}) => {
    // Transpile Gatsby module because Gatsby and Jaen includes un-transpiled ES6 code.
    config.module.rules[0].exclude = [
      /node_modules\/(?!(gatsby|@jaenjs\/jaen|@jaenjs\/snek-finder)\/)/
    ]
    // Use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    config.module.rules[0].use[0].options.plugins.push(
      require.resolve('babel-plugin-remove-graphql-queries')
    )

    return config
  }
}
