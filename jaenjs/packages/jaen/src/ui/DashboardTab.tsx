import {Box, Flex, Icon, SimpleGrid, useColorModeValue} from '@chakra-ui/react'
import {graphql, useStaticQuery} from 'gatsby'
import {Stat} from './components/Dashboard/Stats/Stat'
import {StatLabel} from './components/Dashboard/Stats/StatLabel'
import {StatNumber} from './components/Dashboard/Stats/StatNumber'
import {List} from './components/Dashboard/List/List'
import {ListItem} from './components/Dashboard/List/ListItem'

import UndrawThoughts from './components/Dashboard/assets/undraw_thoughts_re_3ysu.svg'
import {FaRocket} from 'react-icons/fa'
import {usePagesChanges} from '../internal-plugins/pages/internal/services/hooks'
import {useNotificationChanges} from '../internal-plugins/notify/services/hooks'
import {useCoreChanges} from '../services/hooks'
import {IRemoteFileMigration} from '..'
import {useAppSelector} from '../redux'

export const DashboardTab = () => {
  const {
    allJaenNotification,
    allJaenPage,
    jaenInternal: {migrationHistory}
  } = useStaticQuery<{
    allJaenNotification: {
      totalCount: number
    }
    allJaenPage: {
      totalCount: number
    }
    jaenInternal: {
      migrationHistory: Array<IRemoteFileMigration>
    }
  }>(graphql`
    query DashboardTab {
      allJaenNotification {
        totalCount
      }
      allJaenPage {
        totalCount
      }
      jaenInternal {
        migrationHistory {
          fileUrl
          createdAt
        }
      }
    }
  `)

  const coreChanges = useCoreChanges()
  const pagesChanges = usePagesChanges()
  const notifyChanges = useNotificationChanges()

  const changes = coreChanges + pagesChanges + notifyChanges

  const data = [
    {label: 'Total pages', value: allJaenPage.totalCount},
    {label: 'Total notifications', value: allJaenNotification.totalCount},
    {label: 'Unpublished changes', value: changes}
  ]

  const isPublishing = useAppSelector(state => state.status.isPublishing)

  return (
    <>
      <Box as="section" bg={useColorModeValue('gray.50', 'gray.800')} p="10">
        <Box maxW="7xl" mx="auto" px={{base: '6', md: '8'}}>
          <SimpleGrid columns={{base: 1, md: 3}} spacing="6">
            {data.map(({label, value}) => (
              <Stat key={label}>
                <StatLabel>{label}</StatLabel>
                <StatNumber>{value}</StatNumber>
              </Stat>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
      <Flex>
        <Box
          px="6"
          py="5"
          bg={useColorModeValue('gray.50', 'gray.800')}
          flex="1">
          <UndrawThoughts />
        </Box>
        <Box as="section" bg={useColorModeValue('gray.50', 'gray.800')} p="10">
          <Box maxW="md" p={10}>
            <List spacing="12" overflowY="scroll" h={'xs'}>
              {isPublishing && (
                <ListItem
                  title="In progress"
                  subTitle={`Your website will be live in a few minutes.`}
                  circleColor={useColorModeValue('orange.500', 'orange.300')}
                  icon={<Icon as={FaRocket} boxSize="6" />}
                />
              )}

              {migrationHistory
                .sort((a, b) =>
                  new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
                )
                .map((m, i) => (
                  <ListItem
                    key={i}
                    title="Published site"
                    subTitle={`Published on ${new Date(
                      m.createdAt
                    ).toLocaleString()}`}
                    circleColor={useColorModeValue('teal.500', 'teal.300')}
                    icon={<Icon as={FaRocket} boxSize="6" />}
                    isLastItem={i === migrationHistory.length - 1}
                  />
                ))}
            </List>
          </Box>
        </Box>
      </Flex>
    </>
  )
}

export default DashboardTab
