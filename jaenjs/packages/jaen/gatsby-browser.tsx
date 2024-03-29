import {Box, ChakraProvider, Flex} from '@chakra-ui/react'
import {GatsbyBrowser} from 'gatsby'
import React from 'react'
import {theme} from './src'
import {IncomingBuildCheckerProvider} from './src/services/IncomingBuildChecker'
import {AnalyticsProvider} from './src/services/tracking/AnalyticsProvider'
import {IJaenConfig} from './src/types'
import AdminToolbarContainer from './src/ui/AdminToolbar'
import {SnekFinder} from './src/withSnekFinder'

export const wrapRootElement: GatsbyBrowser['wrapRootElement'] = ({
  element
}) => {
  return <IncomingBuildCheckerProvider>{element}</IncomingBuildCheckerProvider>
}

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = (
  {element, props},
  pluginOptions
) => {
  const pathname = window.location.pathname

  const options = (pluginOptions as unknown) as IJaenConfig

  let inner = (
    <Flex direction={'column'} h="100vh" overflow="none">
      <ChakraProvider resetCSS theme={theme}>
        <Box pos="sticky" top="0" zIndex={'banner'}>
          <AdminToolbarContainer />
        </Box>
      </ChakraProvider>

      <Box flex="1" overflow="auto">
        {element}
      </Box>
    </Flex>
  )

  if (pathname.startsWith('/admin')) {
    inner = (
      <ChakraProvider resetCSS theme={theme}>
        <SnekFinder>{element}</SnekFinder>
      </ChakraProvider>
    )
  }

  return (
    <AnalyticsProvider
      pageProps={props}
      snekAnalyticsId={options.snekAnalyticsId}>
      {inner}
    </AnalyticsProvider>
  )
}
