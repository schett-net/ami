# @chakra-ui/storybook-addon

Use Chakra UI in your Storybook stories.

Wraps each of your stories with [`ChakraProvider`][chakraprovider] which can be
configured using Storybook parameters.

## Demo



https://user-images.githubusercontent.com/52858351/164954327-5e395475-f9e5-4569-83e7-fcf3394d9567.mov



## Installation

### yarn

```sh
yarn add -D @snek-at/storybook-addon-chakra-ui
```

### npm

```sh
npm i -D @snek-at/storybook-addon-chakra-ui
```

Add the addon to your configuration in `.storybook/main.js`:

```js
module.exports = {
  addons: ['@snek-at/storybook-addon-chakra-ui']
}
```

## Configuring `ChakraProvider`

If you need to customize the props passed to `ChakraProvider` for your stories
(to use a custom `theme`, for example), you'll need to create custom Storybook
parameters.

To set global parameters for this addon, add a `chakra` object to the
`parameters` export in `.storybook/preview.js`:

```js
import myTheme from '../theme'
export const parameters = {chakra: {theme: myTheme}}
```

The `chakra` parameters take the same shape as the `props` for `ChakraProvider`.
[See the `ChakraProvider` props table][chakraprovider] to see the list of
possible parameters.

### Overriding `ChakraProvider` configuration for individual components or stories

Storybook allows you to define parameters at multiple levels: global, component,
and story. We recommend setting default parameters at the global level, and
overriding them at the component or story when necessary. See the
[Storybook Parameters documentation](https://storybook.js.org/docs/react/writing-stories/parameters)
for more information.

[chakraprovider]: https://chakra-ui.com/docs/getting-started#chakraprovider-props
