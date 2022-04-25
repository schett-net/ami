import {
  Box,
  Button,
  ChakraProvider,
  Divider,
  useBreakpoint,
  Portal,
  Circle
} from '@chakra-ui/react'
import {HomeButton, PublishButton} from '../ui/toolbar'
import {store, useAppSelector, withRedux} from '../redux'
import {navigate} from 'gatsby'
import {AccountSwitcher} from './AccountSwitcher'
import {AdminToolbar} from './components/AdminToolbar'
import JaenActivationButton from './components/JaenActivationButton'
import {DiscardButton, EditButton} from '../internal-plugins/pages/ui/toolbar'
import isMobile from 'is-mobile'
import {useChanges} from '../services/hooks'
import React from 'react'
import {useIncomingBuildChecker} from '../services/IncomingBuildChecker'
import {IncomingBuildBanner} from './components/IncomingBuildBanner'

const ToolbarChangesElement = () => {
  const {totalChanges} = useChanges()

  if (totalChanges === 0) {
    return null
  }

  return (
    <>
      <Box>
        <Divider orientation="vertical" color="red" />
      </Box>
      <Button
        variant={'ghost'}
        size="sm"
        fontWeight="normal"
        pointerEvents={'none'}>
        {totalChanges} {totalChanges === 1 ? 'change' : 'changes'}
      </Button>
      <Box>
        <Divider orientation="vertical" color="red" />
      </Box>
    </>
  )
}

const logoText = 'Jaen Admin'
const toolbarItems = {
  left: [
    <HomeButton />,
    <EditButton />,
    <ToolbarChangesElement />,
    <DiscardButton />,
    <PublishButton />
  ],
  right: [
    <Box w="48">
      <AccountSwitcher />
    </Box>
  ]
}

const AdminToolbarContainer = withRedux(() => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated)
  const {isIncomingBuild, onOpenAlert} = useIncomingBuildChecker()

  const handleJaenActivation = () => {
    if (isMobile()) {
      if (typeof window !== 'undefined') {
        window.scrollTo({top: 0, behavior: 'smooth'})
      }
    } else {
      navigate('/jaen/admin/')
    }
  }

  return (
    <>
      {isIncomingBuild && <IncomingBuildBanner onUpdateClick={onOpenAlert} />}
      {isAuthenticated ? (
        <AdminToolbar logoText={logoText} toolbarItems={toolbarItems} />
      ) : (
        <JaenActivationButton onClick={handleJaenActivation} />
      )}
    </>
  )
})

export default AdminToolbarContainer
