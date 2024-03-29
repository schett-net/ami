import {
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Select
} from '@chakra-ui/react'
import {connectField} from '../..'

type Options = string[]
type Option = Options[number] | null

type ChoiceRenderFn = (
  selection: Option,
  options: Options,
  select: (option: Option) => void,
  isEditing: boolean
) => JSX.Element

const ChoiceField = connectField<
  Option,
  Option,
  {
    displayName?: React.ReactNode
    options: Options
    render: ChoiceRenderFn
    renderPopover: ChoiceRenderFn | null
  }
>(
  ({jaenField, displayName, options, render, renderPopover}) => {
    const selection =
      jaenField.value || jaenField.staticValue || jaenField.defaultValue

    if (!jaenField.isEditing || !renderPopover) {
      return render(
        selection,
        options,
        jaenField.onUpdateValue,
        jaenField.isEditing
      )
    }

    return (
      <Popover trigger="hover" isLazy>
        <PopoverTrigger>
          {render(
            selection,
            options,
            jaenField.onUpdateValue,
            jaenField.isEditing
          )}
        </PopoverTrigger>
        <Portal>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            {displayName && <PopoverHeader>{displayName}</PopoverHeader>}
            <PopoverBody>
              {renderPopover(
                selection,
                options,
                jaenField.onUpdateValue,
                jaenField.isEditing
              )}
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    )
  },
  {
    fieldType: 'IMA:ChoiceField',
    getAdminWidget: ({field, options}) => {
      return (
        <Select
          placeholder="Select option"
          defaultValue={field.defaultValue || undefined}
          value={field.value || undefined}
          onChange={e => field.onChange(e.target.value)}>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )
    }
  }
)

export default ChoiceField
