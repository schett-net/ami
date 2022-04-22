import {graphql, useStaticQuery} from 'gatsby'
import {
  getCollectionStructure,
  ShopifyCollection
} from '@snek-at/gatsby-theme-shopify'

export const useFlatMenu = () => {
  const {navbarCollections} = useStaticQuery<{
    navbarCollections: {nodes: Array<ShopifyCollection>}
  }>(graphql`
    {
      navbarCollections: allShopifyCollection(
        filter: {
          metafields: {
            elemMatch: {key: {eq: "add_to_menu"}, value: {eq: "true"}}
          }
        }
      ) {
        nodes {
          title
          productsCount
        }
      }
    }
  `)

  const flatMenu = navbarCollections.nodes.map(collection => {
    const structure = getCollectionStructure(collection.title)

    return {
      title: structure.name,
      productsCount: collection.productsCount,
      path: structure.path
    }
  })

  return flatMenu
}
