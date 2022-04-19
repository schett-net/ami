import {
  Box,
  Button,
  Flex,
  BoxProps,
  IconButton,
  IconButtonProps,
  useColorModeValue,
  Icon
} from '@chakra-ui/react'
import {FaChevronLeft} from '@react-icons/all-files/fa/FaChevronLeft'
import {FaChevronRight} from '@react-icons/all-files/fa/FaChevronRight'

import React from 'react'
import useDragScroll from './useDragScroll'

const NavigateButton = (props: {
  direction: 'left' | 'right'
  scroll: (direction: 'left' | 'right') => void
}) => {
  return (
    <IconButton
      aria-label={`Slide to ${props.direction}`}
      position="absolute"
      display={{base: 'none', lg: 'block'}}
      boxSize="16"
      top="50%"
      transform="translateY(-50%)"
      zIndex={1}
      cursor="pointer"
      _hover={{boxShadow: '0px 0px 10px rgba(0,0,0,0.1)'}}
      className="button"
      isRound
      onClick={() => props.scroll(props.direction)}
      left={props.direction === 'left' ? 5 : undefined}
      right={props.direction === 'right' ? 5 : undefined}
      bg={useColorModeValue('blackAlpha.600', 'blackAlpha.900')}
      icon={
        <Icon
          color={useColorModeValue('gray.200', 'gray.200')}
          boxSize="8"
          as={props.direction === 'left' ? FaChevronLeft : FaChevronRight}
        />
      }
    />
  )
}

export interface SliderProps extends BoxProps {
  children: React.ReactNode
  elementProps?: BoxProps
  disableControls?: boolean
}

export const Slider: React.FC<SliderProps> = ({
  children,
  elementProps,
  disableControls,
  ...containerProps
}) => {
  const ref = React.useRef(null)

  const {scroll, canScrollLeft, canScrollRight} = useDragScroll({
    sliderRef: ref,
    reliants: []
  })

  const styledChildren = React.Children.map(children, (child, index) => {
    return (
      <Box
        key={index}
        boxSize={'fit-content'}
        m="4"
        {...elementProps}
        flexShrink={0}>
        {child}
      </Box>
    )
  })

  return (
    <Box {...containerProps}>
      <Flex pos="relative">
        <Flex ref={ref} overflowX="scroll">
          {styledChildren}
        </Flex>
        {!disableControls && (
          <>
            {canScrollLeft && (
              <NavigateButton direction="left" scroll={scroll} />
            )}
            {canScrollRight && (
              <NavigateButton direction="right" scroll={scroll} />
            )}
          </>
        )}
      </Flex>
    </Box>
  )
}
