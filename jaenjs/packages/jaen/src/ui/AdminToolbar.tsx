import {
  Box,
  ChakraProvider,
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
import React from 'react'
import {useIncomingBuildChecker} from '../services/IncomingBuildChecker'
import {IncomingBuildBanner} from './components/IncomingBuildBanner'
import {ToolbarChangesElement} from './ToolbarChangesElement'
import {useNavigate} from '../utils/hooks/useNavigate'

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

  const navigate = useNavigate()

  const handleJaenActivation = () => {
    if (isAuthenticated) {
      navigate('/admin/')
    } else {
      navigate('/admin/login')
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
