import {Box, Flex, Spacer, Stack, Text} from '@chakra-ui/react'
import * as React from 'react'

import {getPackageJsonVersion} from '../../utils/helper'
import {NavGroup} from './NavGroup'
import {NavItem} from './NavItem'

export type SidebarItem = {
  path: string
  icon: JSX.Element
  label: string
}

export interface UIProps {
  toolbar: JSX.Element
  sidebarItems: {
    activePath: string
    ungrouped: Array<SidebarItem>
    grouped: {
      [group: string]: {
        label: string
        items: Array<SidebarItem>
      }
    }
  }
  onSidebarItemClick: (path: string) => void
}

export const AdminPageShell: React.FC<React.PropsWithChildren<UIProps>> = ({
  toolbar,
  children,
  sidebarItems,
  onSidebarItemClick
}) => {
  return (
    <Box height="100vh" overflow="hidden" position="relative">
      {toolbar}
      <Flex h="calc(100vh - 54px)" id="app-container">
        <Box w="64" minW="56" bg="gray.900" color="white" fontSize="sm">
          <Flex h="100%" direction="column" px="4" py="4">
            <Stack spacing="8" flex="1">
              <Stack spacing="1">
                {sidebarItems.ungrouped.map(item => (
                  <NavItem
                    active={item.path === sidebarItems.activePath}
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => onSidebarItemClick(item.path)}
                  />
                ))}
              </Stack>

              {Object.entries(sidebarItems.grouped).map(([key, group]) => (
                <NavGroup key={key} label={group.label}>
                  {group.items.map(item => (
                    <NavItem
                      active={item.path === sidebarItems.activePath}
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => onSidebarItemClick(item.path)}
                    />
                  ))}
                </NavGroup>
              ))}
            </Stack>

            <Spacer />
            <Text w={'full'} textAlign="center">
              {getPackageJsonVersion()}
            </Text>
          </Flex>
        </Box>
        <Box bg={'gray.900'} boxSize="full" overflowY="hidden" p="2" pr="4">
          <Box boxSize="full" rounded="lg" bg="white" p="6">
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export default AdminPageShell
