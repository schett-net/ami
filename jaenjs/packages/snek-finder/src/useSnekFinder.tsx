import update from 'immutability-helper'
import * as React from 'react'
import {Backend} from './backends/backend'
import Finder from './components/organisms/Finder'
import {
  FinderFileItem,
  FinderFolderItem,
  FinderMode,
  SnekFinderAction
} from './components/organisms/Finder/types'
import ImageViewer from './components/organisms/ImageViewer'
import PdfViewer from './components/organisms/PdfViewer'
import SnekStudio from './components/organisms/SnekStudio'
import {useSnekFinderContext} from './SnekFinderProvider'

export interface IUseSnekFinderArgs {
  onAction?: (action: SnekFinderAction) => void
  mode: FinderMode
}

export interface IUseSnekFinder {
  finderElement: JSX.Element
  toggleSelector: () => void
  toggleSelectorPreview: (fileId: string) => void
}

export const useSnekFinder = ({
  onAction,
  mode
}: IUseSnekFinderArgs): IUseSnekFinder => {
  const {backend, initData, rootFileId} = useSnekFinderContext()

  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false)
  const [data, setData] = React.useState(initData)

  React.useEffect(() => {
    setData(initData)
  }, [initData])

  React.useEffect(() => {
    const fn = async () => {
      const index = await backend.readIndex()

      setData(index || initData)
    }

    fn()
  }, [])

  const [openFile, setOpenFile] = React.useState<{
    fileId: string
    previewType: 'IMAGE_VIEWER' | 'PDF_VIEWER' | 'SNEK_STUDIO'
  } | null>(null)

  const openedFileItem = React.useMemo(() => {
    if (!openFile) {
      return null
    }

    const {fileId} = openFile

    const item = data[fileId]

    if (!item) {
      return null
    } else if ((item as any).isFolder) {
      return null
    }

    return item as FinderFileItem
  }, [openFile, data])

  const handleDataChange = React.useCallback(
    async (newData: any, action: SnekFinderAction) => {
      onAction && onAction(action)

      if (action.type === 'ADD') {
        const {uuid, file} = action.payload

        if (file) {
          const url = await backend.upload(file)

          newData[uuid] = update(newData[uuid], {
            src: {$set: url}
          })
        }
      }
      setData(newData)

      backend.writeIndex(newData)
    },
    [onAction, setData, backend, data]
  )

  const handleFileOpen = React.useCallback(
    (fileId: string) => {
      const file = data[fileId]

      if (!(file as FinderFolderItem).isFolder) {
        const {mimeType} = file as FinderFileItem
        if (mimeType && mimeType.startsWith('image/')) {
          setOpenFile({fileId, previewType: 'IMAGE_VIEWER'})
        } else if (mimeType && mimeType.startsWith('application/pdf')) {
          setOpenFile({fileId, previewType: 'PDF_VIEWER'})
        }
      }
    },
    [data, setOpenFile]
  )

  const handleFinderClose = React.useCallback(() => {
    setOpenFile(null)
    setIsSelectorOpen(false)
  }, [setOpenFile, isSelectorOpen, setIsSelectorOpen])

  const toggleSelector = React.useCallback(() => {
    setIsSelectorOpen(!isSelectorOpen)
  }, [isSelectorOpen, setIsSelectorOpen])

  const toggleSelectorPreview = React.useCallback(
    (fileId: string) => {
      toggleSelector()
      handleFileOpen(fileId)
    },
    [toggleSelector]
  )

  const toggleSelectorSelect = React.useCallback(
    (action: SnekFinderAction) => {
      onAction && onAction(action)

      toggleSelector()
    },
    [toggleSelector]
  )

  const finderElement = (
    <>
      {openFile && openedFileItem && (
        <>
          {openFile.previewType === 'IMAGE_VIEWER' && (
            <ImageViewer
              src={openedFileItem.src}
              onOpenStudio={() => {
                setOpenFile({...openFile, previewType: 'SNEK_STUDIO'})
              }}
              onClose={() => setOpenFile(null)}
            />
          )}
          {openFile.previewType === 'PDF_VIEWER' && (
            <PdfViewer
              src={openedFileItem.src}
              overlay
              toolbar
              onClose={() => setOpenFile(null)}
            />
          )}
          {openFile.previewType === 'SNEK_STUDIO' && (
            <SnekStudio
              src={openedFileItem.src}
              onComplete={async (blob, dataURL) => {
                const fileId = openFile.fileId
                setData(update(data, {[fileId]: {src: {$set: dataURL}}}))

                // upload blob to backend
                if (blob) {
                  const url = await backend.upload(
                    new File([blob], openedFileItem.name)
                  )

                  const newData = update(data, {
                    [fileId]: {src: {$set: url}}
                  })

                  setData(newData)

                  backend.writeIndex(newData)
                }
              }}
              onClose={() =>
                setOpenFile({...openFile, previewType: 'IMAGE_VIEWER'})
              }
            />
          )}
        </>
      )}
      {!(mode === 'selector' && !isSelectorOpen) && (
        <Finder
          data={data}
          mode={mode}
          rootUUID={rootFileId}
          onItemOpen={handleFileOpen}
          onDataChanged={handleDataChange}
          onSelectorClose={handleFinderClose}
          onSelectorSelect={toggleSelectorSelect}
        />
      )}
    </>
  )

  return {
    finderElement,
    toggleSelector,
    toggleSelectorPreview
  }
}