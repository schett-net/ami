import {SEO} from '@jaenjs/jaen'
import {
  getCollectionStructure,
  ProductsPageContext,
  ProductsPageData,
  SearchProvider,
  useProductSearch
} from '@snek-at/gatsby-theme-shopify'
import {PageProps} from 'gatsby'
import React from 'react'
import {Layout} from '../components/Layout'
import {ProductsTemplate} from '../components/templates'
import {ProductsTemplateProps} from '../components/templates/ProductsTemplate/ProductsTemplate'

const ProductsPageTemplate = (
  props: PageProps<ProductsPageData, ProductsPageContext>
) => {
  const {
    implicitTags,
    tags,
    maxPrice,
    minPrice,
    vendors,
    productTypes
  } = props.pageContext

  const search = useProductSearch({
    filters: {
      mainTag: implicitTags.length > 0 ? implicitTags[0] : undefined
    }
  })

  const onSortChange = (sort: string) => {
    let sortKey

    let reverse

    switch (sort) {
      case 'Alphabetisch':
        sortKey = 'TITLE'
        reverse = false
        break
      case 'Preis aufsteigend':
        sortKey = 'PRICE'
        reverse = false
        break
      case 'Preis absteigend':
        sortKey = 'PRICE'
        reverse = true
        break
      default:
        sortKey = 'TITLE'
        reverse = false
    }

    search.onChangeOptions({
      sortKey,
      reverse
    })
  }

  const updateFilter = (filters: Partial<ProductsTemplateProps['filters']>) => {
    console.log('set filters', filters)
    search.onChangeFilter({
      ...filters,
      maxPrice: filters.maxPrice || undefined,
      minPrice: filters.minPrice || undefined
    })
  }

  const buildProductsPageMeta = () => {
    const collectionTitle = props.pageContext.collectionId

    let title = 'Sortiment'
    let description =
      'Unser Sortiment' +
      ' | Hersteller: ' +
      vendors.join(', ') +
      ' | Produkttypen: ' +
      productTypes.join(', ') +
      ' | Tags: ' +
      tags.join(', ')

    if (collectionTitle) {
      const struct = getCollectionStructure(collectionTitle)

      if (struct.name) {
        title = struct.name
        description += ' | Kategorie: ' + title
      }
    }

    return {
      title,
      description
    }
  }

  return (
    <>
      <SEO pagePath={props.path} pageMeta={buildProductsPageMeta()} />
      <Layout path={props.path}>
        <ProductsTemplate
          path={props.path}
          products={search.products}
          isFetching={search.isFetching}
          fetchNextPage={search.fetchNextPage}
          filters={{
            tags,
            vendors,
            productTypes,
            minPrice,
            maxPrice
          }}
          activeFilters={search.filters}
          updateFilter={updateFilter}
          sortOptions={[
            'Alphabetisch',
            'Preis aufsteigend',
            'Preis absteigend'
          ]}
          onSortChange={onSortChange}
        />
      </Layout>
    </>
  )
}

export default (
  props: JSX.IntrinsicAttributes &
    PageProps<ProductsPageData, ProductsPageContext, unknown, object>
) => (
  <SearchProvider>
    <ProductsPageTemplate {...props} />
  </SearchProvider>
)
