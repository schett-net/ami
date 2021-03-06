import {
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuProps,
  Portal,
  PortalProps,
  useEventListener
} from '@chakra-ui/react'
import * as React from 'react'
import {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react'

interface SimpleMenuProps extends Omit<MenuProps, 'children'> {}

export interface ContextMenuProps<T extends HTMLElement> {
  renderMenu: () => JSX.Element | null
  children: (ref: MutableRefObject<T | null>) => JSX.Element | null
  menuProps?: SimpleMenuProps
  portalProps?: PortalProps
  menuButtonProps?: MenuButtonProps
}

export function ContextMenu<T extends HTMLElement = HTMLElement>(
  props: ContextMenuProps<T>
) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [isDeferredOpen, setIsDeferredOpen] = useState(false)
  const [position, setPosition] = useState<[number, number]>([0, 0])
  const targetRef = useRef<T>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsRendered(true)
        setTimeout(() => {
          setIsDeferredOpen(true)
        })
      })
    } else {
      setIsDeferredOpen(false)
      const timeout = setTimeout(() => {
        setIsRendered(isOpen)
      }, 1000)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  useEventListener('contextmenu', e => {
    if (
      targetRef.current?.contains(e.target as any) ||
      e.target === targetRef.current
    ) {
      e.preventDefault()
      setIsOpen(true)
      setPosition([e.pageX, e.pageY])
    } else {
      setIsOpen(false)
    }
  })

  const onCloseHandler = useCallback(() => {
    props.menuProps?.onClose?.()
    setIsOpen(false)
  }, [props.menuProps?.onClose, setIsOpen])

  const onContextMenuHandler = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  return (
    <>
      {props.children(targetRef)}
      {isRendered && (
        <Portal {...props.portalProps} appendToParentPortal={true}>
          <div onContextMenu={onContextMenuHandler}>
            <Menu
              isOpen={isDeferredOpen}
              gutter={0}
              {...props.menuProps}
              onClose={onCloseHandler}>
              <MenuButton
                aria-hidden={true}
                w={1}
                h={1}
                style={{
                  position: 'absolute',
                  left: position[0],
                  top: position[1],
                  cursor: 'default'
                }}
                {...props.menuButtonProps}
              />
              {props.renderMenu()}
            </Menu>
          </div>
        </Portal>
      )}
    </>
  )
}
