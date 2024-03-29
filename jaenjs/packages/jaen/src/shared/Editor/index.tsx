import {Box} from '@chakra-ui/react'
import styled from '@emotion/styled'
import * as React from 'react'
import {OSGUploadAdapterPlugin} from './OSGUploadAdapter'

const EditorWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  min-height: 20px;

  .ck.ck-editor__editable_inline[dir='ltr'] {
    text-align: inherit;
  }

  .ck.ck-editor__editable_inline[dir='rtl'] {
    text-align: inherit;
  }

  .ck-content > * {
    all: revert;
  }

  .ck-focused {
    border: none !important;
    box-shadow: 0 0 0 2.5px #4fd1c5 !important;
  }

  .ck-blurred:hover {
    box-shadow: 0 0 0 2.5px #4fd1c5 !important;
    transition: box-shadow 0.3s ease-in-out;
  }

  .ck-editor__editable_inline {
    padding: 0 !important;
    border: none !important;
    overflow: unset !important;
  }
  .ck.ck-editor__editable_inline > *:first-of-type {
    margin-top: 0 !important;
  }

  .ck.ck-editor__editable_inline > *:last-child {
    margin-bottom: 0 !important;
  }
`

const LoadableCKEditor = React.lazy(() =>
  // @ts-ignore
  import('@ckeditor/ckeditor5-react').then(module => ({
    default: module.CKEditor
  }))
)

type EditorProps = {
  defaultValue: string
  value?: string
  editing: boolean
  disableToolbar: boolean
  /**
   * Get the data from the editor on blur.
   *
   * Only called when the editor is in edit mode and the data is not the same as the default value.
   *
   * @param data - The data that was changed
   */
  onBlurValue: (data: string) => void
}

let BalloonEditor: any = undefined

const cleanValue = (defaultValue: string, value?: string) => {
  let v = value || defaultValue || ''

  // Check if the default value does not contain any HTML tags
  // If so, wrap it in a <p> tag, else return the default value
  if (v.indexOf('<') === -1) {
    return `<p>${v}</p>`
  }

  return v
}

/**
 * TODO: Renders twice all the time. :(
 */
const Editor: React.FC<EditorProps> = props => {
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    if (!props.editing && isFocused) {
      setIsFocused(false)
    }
  }, [props.editing])

  const [value, setValue] = React.useState(() =>
    cleanValue(props.defaultValue, props.value)
  )

  React.useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(props.value)) {
      setValue(cleanValue(props.defaultValue, props.value))
    }
  }, [props.value, props.editing])

  const editorConfig: {[key: string]: any} = {
    mediaEmbed: {
      previewsInData: true
    },
    extraPlugins: [OSGUploadAdapterPlugin],
    link: {
      addTargetToExternalLinks: true
    }
  }

  if (props.disableToolbar) {
    editorConfig['toolbar'] = []
  }

  const [editor, setEditor] = React.useState(BalloonEditor)

  React.useEffect(() => {
    async function load() {
      if (!BalloonEditor && !editor && props.editing) {
        //@ts-ignore
        BalloonEditor = await import('@ckeditor/ckeditor5-build-balloon')

        setEditor(BalloonEditor)
      }
    }

    load()
  })

  let hoverTimeout: NodeJS.Timeout

  const handleMouseOver = () => {
    if (!props.editing) {
      return
    }

    if (isFocused) {
      return
    }

    hoverTimeout = setTimeout(() => {
      setIsFocused(true)
    }, 100)
  }

  const handleMouseLeave = () => {
    if (!props.editing) {
      return
    }

    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }
  }

  const fallbackRef = React.useRef<HTMLDivElement>(null)

  const fallbackElement = (
    <div
      ref={fallbackRef}
      className="ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline"
      dangerouslySetInnerHTML={{__html: value}}
    />
  )

  React.useEffect(() => {
    if (fallbackRef.current) {
      fallbackRef.current.innerHTML = value
    }
  }, [value])

  const editorElement = (
    <React.Suspense fallback={fallbackElement}>
      {props.editing && isFocused && editor ? (
        <>
          <LoadableCKEditor
            fallback={fallbackElement}
            //@ts-ignore
            editor={editor?.default}
            config={editorConfig}
            data={value}
            //@ts-ignore
            onBlur={(_, editor) => {
              const data = editor.getData()

              if (data !== value) {
                setValue(data || props.defaultValue)

                props.onBlurValue(data)
              }
            }}
            onLoad={(editor: any) => {
              editor.writer.addClass('revert-css')
            }}
          />
        </>
      ) : (
        fallbackElement
      )}
    </React.Suspense>
  )
  return (
    <EditorWrapper
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}>
      {editorElement}
    </EditorWrapper>
  )
}

export default Editor
