import fs from 'fs'
import {GatsbyNode} from 'gatsby'
import 'isomorphic-fetch'
import path from 'path'
import {getJaenDataForPlugin} from '../../services/migration/get-jaen-data-for-plugin'
import {convertToSlug} from '../../utils/helper'
import {sourceTemplates} from './gatsby-config'
import {processPage} from './internal/services/imaProcess'
import {generateOriginPath, PageNode} from './internal/services/path'
import {IJaenFields, IJaenPage, IPagesMigrationBase} from './types'

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  plugins,
  actions,
  loaders,
  stage,
  getNodesByType
}) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        ___JAEN_TEMPLATES___: JSON.stringify(sourceTemplates)
      })
    ],
    resolve: {
      fallback: {
        fs: false
      }
    }
  })

  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /canvas/,
            use: loaders.null()
          },
          {
            test: /filerobot-image-editor/,
            use: loaders.null()
          }
        ]
      }
    })
  }
}

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({
  actions,
  reporter
}) => {
  actions.createFieldExtension({
    name: 'file',
    args: {},
    extend(options: any, prevFieldConfig: any) {
      return {
        args: {},
        resolve(
          source: {
            name: string
            jaenFiles: any[]
            jaenFields: IJaenFields
            headPtr: string
            tailPtr: string
          },
          args: any,
          context: any,
          info: any
        ) {
          const fieldName = info.fieldName
          const fieldPathKey = info.path.key

          // Throw a error if the fieldKey is the same as the fieldName
          // this is to ensure that the fieldKey is set to the correct fieldName
          // of the IMA:ImageField.
          if (fieldPathKey === info.fieldName) {
            throw new Error(
              `The fieldKey ${fieldPathKey} is the same as the fieldName ${fieldName}, please set the fieldKey to the correct fieldName of an ImageField.`
            )
          }

          const imageId =
            source.jaenFields?.['IMA:ImageField']?.[fieldPathKey]?.value
              ?.imageId

          const node = context.nodeModel.getNodeById({
            id: imageId,
            type: 'File'
          })

          return node
        }
      }
    }
  })

  actions.createTypes(`
    type JaenPage implements Node {
      id: ID!
      slug: String!
      jaenPageMetadata: JaenPageMetadata!
      jaenFields: JSON
      jaenFile: File @file
      jaenFiles: [File] @link

      sections: [JaenSection!]!

      template: String
      excludedFromIndex: Boolean
    }

    type JaenSection {
      fieldName: String!
      items: [JaenSectionItem!]!
      ptrHead: String
      ptrTail: String
    }

    type JaenSectionItem {
      id: ID!
      type: String!
      ptrPrev: String
      ptrNext: String
      jaenFields: JSON
      jaenFiles: [File] @link
      jaenFile: File @file

      sections: [JaenSection!]!
    }

    type JaenSectionPath {
      fieldName: String!
      sectionId: String
    }


    type JaenPageMetadata {
      title: String!
      description: String
      image: String
      canonical: String
      datePublished: String
      isBlogPost: Boolean
    }
    `)
}

export const sourceNodes: GatsbyNode['sourceNodes'] = async ({
  actions,
  createNodeId,
  createContentDigest,
  getNodesByType,
  cache,
  store,
  reporter
}) => {
  const {createNode} = actions
  reporter.info('Starting create pages')

  let pages = await getJaenDataForPlugin<IPagesMigrationBase>('JaenPages@0.0.1')

  for (const [id, page] of Object.entries(pages)) {
    const jaenPage = ((await (
      await fetch(page.context.fileUrl)
    ).json()) as unknown) as IJaenPage

    await processPage({
      page: jaenPage,
      createNodeId,
      createNode,
      cache,
      store,
      reporter
    })

    const path = id.split('JaenPage ')[1]

    const node = {
      ...jaenPage,
      jaenPageMetadata: jaenPage.jaenPageMetadata || {
        title: path
      },
      slug: jaenPage.slug || convertToSlug(path),
      id,
      template: jaenPage.template || null,
      sections: jaenPage.sections || [],
      parent: jaenPage.parent ? jaenPage.parent.id : null,
      children: jaenPage.children?.map(child => child.id) || [],
      internal: {
        type: 'JaenPage',
        content: JSON.stringify(jaenPage),
        contentDigest: createContentDigest(jaenPage)
      }
    }

    console.log(`Creating node for ${path}`)
    console.log(node)

    createNode(node)
  }

  //> Fetch template files and proccess them
}

export const createPages: GatsbyNode['createPages'] = async ({
  actions,
  graphql,
  reporter
}) => {
  const {createPage} = actions

  interface QueryData {
    allTemplate: {
      nodes: Array<{
        name: string
        absolutePath: string
      }>
    }
    allJaenPage: {
      nodes: Array<
        PageNode & {
          template: string
        }
      >
    }
  }

  const result = await graphql<QueryData>(`
    query {
      allTemplate: allFile(
        filter: {sourceInstanceName: {eq: "jaen-templates"}}
      ) {
        nodes {
          name
          absolutePath
        }
      }
      allJaenPage {
        nodes {
          id
          slug
          parent {
            id
          }
          template
        }
      }
    }
  `)

  if (result.errors || !result.data) {
    reporter.panicOnBuild(`Error while running GraphQL query. ${result.errors}`)
    return
  }

  const {allTemplate, allJaenPage} = result.data

  allJaenPage.nodes.forEach(node => {
    const {template} = node
    const pagePath = generateOriginPath(allJaenPage.nodes, node)

    if (template) {
      if (!pagePath) {
        reporter.panicOnBuild(`Error while generating path for page ${node.id}`)
        return
      }

      const component = allTemplate.nodes.find(e => e.name === template)
        ?.absolutePath

      if (!component) {
        reporter.panicOnBuild(
          `Could not find template for page ${node.id} (${template})`
        )
        return
      }

      createPage({
        path: pagePath,
        component,
        context: {
          jaenPageId: node.id
        }
      })
    }

    // Create a json file for the page in the public folder

    const fileName = pagePath === '/' ? 'index' : pagePath

    const outputPath = path.join('./public', `${fileName}.json`)
    const outputDir = path.dirname(outputPath)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    fs.writeFileSync(outputPath, JSON.stringify(node))
  })

  // Dynamic routing pages

  // stepPage.matchPath is a special key that's used for matching pages
  // only on the client.
  createPage({
    path: '/_',
    matchPath: '/_/*',
    component: require.resolve(
      '../../../src/internal-plugins/pages/internal/services/routing/pages/_.tsx'
    ),
    context: {}
  })
}

export const onCreatePage: GatsbyNode['onCreatePage'] = ({
  actions,
  page,
  createNodeId,
  createContentDigest,
  getNode
}) => {
  const {createPage, deletePage, createNode} = actions
  const {path, context} = page

  let stepPage = page

  const blacklist = ['/admin']

  // skip if the page is in the blacklist
  if (blacklist.includes(path)) {
    return
  }

  // Check if the page has a `jaenPageId` in its context.
  // If not it means it's not a JaenPage and we must create one.
  if (!context.jaenPageId) {
    if (!context.skipJaenPage) {
      const jaenPageId = `JaenPage ${path}`

      const slugifiedPath = convertToSlug(path)

      if (!getNode(jaenPageId)) {
        const jaenPage: IJaenPage = {
          id: jaenPageId,
          slug: slugifiedPath,
          parent: null,
          children: [],
          jaenPageMetadata: {
            title: path,
            description: '',
            image: '',
            canonical: '',
            datePublished: '',
            isBlogPost: false
          },
          jaenFields: null,
          jaenFiles: [],
          sections: [],
          template: null
        }

        createNode({
          ...jaenPage,
          parent: null,
          children: [],
          jaenFiles: [],
          internal: {
            type: 'JaenPage',
            content: JSON.stringify(jaenPage),
            contentDigest: createContentDigest(jaenPage)
          }
        })
      }

      stepPage = {...stepPage, context: {...context, jaenPageId}}
    }
  }

  deletePage(page)
  createPage(stepPage)
}

// export const onCreatePage: GatsbyNode['onCreatePage'] = async ({
//   page,
//   actions,
//   getNode,
//   createNodeId,
//   createContentDigest
// }) => {
//   const {createNode} = actions

//   const slugifiedPath = convertToSlug(page.path)

//   const jaenPage: IJaenPage = {
//     id: createNodeId(`JaenPage ${page.path}`),
//     slug: slugifiedPath,
//     parent: null,
//     children: [],
//     jaenPageMetadata: {
//       title: page.path,
//       description: '',
//       image: '',
//       canonical: '',
//       datePublished: '',
//       isBlogPost: false
//     },
//     jaenFields: null,
//     jaenFiles: [
//       {
//         id: '622f4dfc-0606-5555-8293-51c335d6bc79',
//         childImageSharp: {
//           gatsbyImageData: {
//             layout: 'constrained',
//             backgroundColor: '#c8c8c8',
//             images: {
//               fallback: {
//                 src: '/static/76ee411a4ec6dfc676c58e0f1e849d72/66a6c/photo-1518791841217-8f162f1e1131.jpg',
//                 srcSet:
//                   '/static/76ee411a4ec6dfc676c58e0f1e849d72/a83d8/photo-1518791841217-8f162f1e1131.jpg 750w,\n/static/76ee411a4ec6dfc676c58e0f1e849d72/66a6c/photo-1518791841217-8f162f1e1131.jpg 800w',
//                 sizes: '(min-width: 800px) 800px, 100vw'
//               },
//               sources: [
//                 {
//                   srcSet:
//                     '/static/76ee411a4ec6dfc676c58e0f1e849d72/80567/photo-1518791841217-8f162f1e1131.webp 750w,\n/static/76ee411a4ec6dfc676c58e0f1e849d72/1668a/photo-1518791841217-8f162f1e1131.webp 800w',
//                   type: 'image/webp',
//                   sizes: '(min-width: 800px) 800px, 100vw'
//                 }
//               ]
//             },
//             width: 800,
//             height: 533
//           }
//         }
//       }
//     ],
//     sections: [
//       {
//         fieldName: 'body',
//         ptrHead: null,
//         ptrTail: null,
//         items: [
//           {
//             id: '1',
//             jaenFields: null,
//             jaenFiles: [],
//             ptrNext: null,
//             ptrPrev: null,
//             sections: [
//               {
//                 fieldName: 'subbody',
//                 ptrHead: null,
//                 ptrTail: null,
//                 items: [
//                   {
//                     id: '1',
//                     jaenFields: null,
//                     jaenFiles: [],
//                     ptrNext: null,
//                     ptrPrev: null,
//                     sections: []
//                   }
//                 ]
//               }
//             ],
//             body: {
//               id: '2',
//               jaenFields: null,
//               jaenFiles: [],
//               ptrNext: null,
//               ptrPrev: null,
//               sections: []
//             }
//           }
//         ]
//       }
//     ],
//     body: {
//       id: '1',
//       jaenFields: null,
//       jaenFiles: [],
//       ptrNext: null,
//       ptrPrev: null,
//       sections: []
//     },
//     template: null
//   }

//   createNode({
//     ...jaenPage,
//     parent: null,
//     children: [],
//     internal: {
//       type: 'JaenPage',
//       content: JSON.stringify(jaenPage),
//       contentDigest: createContentDigest(jaenPage)
//     }
//   })
// }
