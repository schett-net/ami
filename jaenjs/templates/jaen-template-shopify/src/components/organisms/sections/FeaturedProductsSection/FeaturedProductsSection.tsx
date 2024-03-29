import {Button} from '@chakra-ui/button'
import {Box, Center, Container, Divider, Heading} from '@chakra-ui/layout'
import {connectSection, Field} from '@jaenjs/jaen'
import {ShopifyProduct} from '@snek-at/gatsby-theme-shopify'
import {Link as GatsbyLink} from 'gatsby'
import React, {ReactNode} from 'react'

import {getThemeColor} from '../../../../common/utils'
import {Bullet} from '../../../atoms/Bullet'
import {ProductGrid} from '../../../molecules/ProductGrid'
import {StickyStrokeLogo} from '../../../molecules/StickyStrokeLogo'
import * as style from './style'

export interface FeaturedProductsSectionProps {
  name: string
  displayName: string
  anchor?: string
  featuredProducts: ShopifyProduct[]
  productsPagePath?: string
}

export interface FeaturedProductsProps {
  anchor?: string
  featuredProducts: ShopifyProduct[]
  productsPagePath: string
  heading: ReactNode
}

export const FeaturedProducts = ({
  anchor,
  heading,
  featuredProducts,
  productsPagePath
}: FeaturedProductsProps) => {
  return (
    <>
      <StickyStrokeLogo
        strokeColor={getThemeColor('stroke')}
        backgroundColor={getThemeColor('background')}
      />
      <Box
        id={anchor}
        position="relative"
        overflow="hidden"
        css={style.Section}>
        <Divider
          orientation="vertical"
          position="absolute"
          zIndex={-1}
          // w="0"
          // h="100%"
          top="0"
          left="calc(4em + 2.5vw)"
          // borderLeft="1px"
          borderColor="stroke"
          display={{base: 'none', '2xl': 'block'}}
        />
        <Container position="relative" py="10" maxW="8xl">
          <Box textAlign="center" my="10">
            <Heading size="2xl">{heading}</Heading>
            <Bullet color="agt.red" w="unset" fontSize="xl" mt="5" mb="10" />
          </Box>
          <ProductGrid
            prefixPath={productsPagePath}
            products={featuredProducts}
            spacing="5"
            columns={{base: 2, md: 3, xl: 4}}
          />
          <Center mt="10">
            <Button
              as={GatsbyLink}
              to={productsPagePath}
              color="white"
              borderRadius="5px"
              colorScheme="agt.grayScheme"
              variant="solid"
              size="lg">
              Mehr davon
            </Button>
          </Center>
        </Container>
      </Box>
    </>
  )
}

export const FeaturedProductsSection = ({
  name,
  displayName,
  anchor,
  featuredProducts,
  productsPagePath = '/products'
}: FeaturedProductsSectionProps) =>
  connectSection(
    () => {
      return (
        <FeaturedProducts
          anchor={anchor}
          heading={<Field.Text name="heading" defaultValue={'Über uns'} />}
          featuredProducts={featuredProducts}
          productsPagePath={productsPagePath}
        />
      )
    },
    {
      name: name,
      displayName: displayName
    }
  )

export const FeaturedProductsSectionJSX = ({
  name,
  displayName,
  anchor,
  featuredProducts,
  productsPagePath
}: FeaturedProductsSectionProps) => (
  <Field.Section
    name={name}
    displayName={displayName}
    sections={[
      FeaturedProductsSection({
        name: `${name}-item`,
        anchor,
        displayName,
        featuredProducts,
        productsPagePath
      })
    ]}
  />
)
