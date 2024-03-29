export const StorefrontProductsQuery = `
  query ($query: String!, $sortKey: ProductSortKeys, $first: Int, $last: Int, $after: String, $before: String, $reverse: Boolean, $metafieldIdentifiers: [HasMetafieldsIdentifier!]!) {
    products(
      query: $query
      sortKey: $sortKey
      first: $first
      last: $last
      after: $after
      before: $before
      reverse: $reverse
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      edges {
        cursor
        node {
          title
          handle
          description
          descriptionHtml
          totalInventory
          createdAt
          vendor
          productType
          variants(first: 100) {
            nodes {
              price {
                amount
                currencyCode
              }
              sku
              id
              compareAtPrice {
                amount
                currencyCode
              }
            }
            edges {
              node {
                id
              }
            }
          }
          id
          tags
          metafields(identifiers: $metafieldIdentifiers) {
            key
            value
            namespace
          }
          featuredImage {
            id
            url
            width
            height
            altText
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                width
                height
                altText
              }
            }
          }
        }
      }
    }
  }
`
