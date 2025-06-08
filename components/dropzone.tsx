'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import BoundingBox from './bounding-box'
import { motion, AnimatePresence } from 'framer-motion'
import { Player } from '@lottiefiles/react-lottie-player'

export default function Dropzone({
  status,
  setStatus,
  detector,
  result,
  setResult,
  className
}: {
  status: string
  setStatus: Function
  detector: Function
  result: any
  setResult: Function
  className: string
}) {
  const [files, setFiles] = useState<any[]>([])
  const [rejected, setRejected] = useState<any[]>([])

  const onDrop = useCallback(
    (accepted: any[], rejected: any[]) => {
      if (accepted?.length) {
        setFiles([
          ...accepted.map(file =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          )
        ])

        setStatus('ready')
        setResult(null)

        const reader = new FileReader()

        reader.onload = function (e) {
          const image = e?.target?.result
          detector(image)
        }

        reader.readAsDataURL(accepted[0])
      }

      if (rejected?.length) {
        setRejected(rejected)
      }
    },
    [detector, setResult, setStatus]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': []
    },
    maxSize: 1024 * 1000,
    maxFiles: 1,
    onDrop
  })

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const remove = () => {
    setFiles([])
    setRejected([])
  }

  return (
    <>
      <motion.div
        {...getRootProps({
          className: cn(className, 'dropzone')
        })}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 0 0 10px rgba(99,102,241,0.08)'
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <input {...getInputProps({ name: 'file' })} />
        <div className='flex flex-col items-center justify-center gap-4'>
          {isDragActive ? (
            <p className='text-indigo-600 font-medium'>Drop the files here ...</p>
          ) : (
            <p className='text-gray-500'>
              Drag & drop files here, or{' '}
              <span className='text-indigo-600 underline'>click to select files</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Preview */}
      <section className='mt-6'>
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              className='relative h-[400px] rounded-2xl shadow-lg bg-white uploaded-preview'
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={files[0].preview}
                alt={files[0].name}
                fill
                style={{ objectFit: 'cover' }}
                onLoad={() => {
                  URL.revokeObjectURL(files[0].preview)
                }}
                className={cn(
                  'rounded-2xl object-cover',
                  status !== 'complete' && 'animate-pulse'
                )}
              />

              {result &&
                result.map((object: any, index: number) => (
                  <BoundingBox key={index} object={object} />
                ))}

              <button
                type='button'
                className='absolute -right-3 -top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-rose-400 bg-rose-400 text-white transition-colors hover:bg-white hover:text-rose-400'
                onClick={() => remove()}
              >
                <X strokeWidth={1.5} className='h-5 w-5' />
              </button>
              {status !== 'complete' && (
                <div className='absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/50 text-xl font-semibold text-white'>
                  <Player
                    src='https://assets3.lottiefiles.com/packages/lf20_zrqthn6o.json'
                    background='transparent'
                    speed={1}
                    style={{ width: 120, height: 120 }}
                    loop
                    autoplay
                  />
                  Detecting Objects...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {rejected.length > 0 && (
          <div>
            <h3 className='title mt-24 border-b pb-3 text-lg font-semibold text-gray-600'>
              Rejected Files
            </h3>
            <ul className='mt-6 flex flex-col'>
              {rejected.map(({ file, errors }) => (
                <li
                  key={file.name}
                  className='flex items-start justify-between'
                >
                  <div>
                    <p className='mt-2 text-sm font-medium text-gray-500'>
                      {file.name}
                    </p>
                    <ul className='text-[12px] text-red-400'>
                      {errors.map((error: any) => (
                        <li key={error.code}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type='button'
                    className='mt-1 rounded-lg border border-rose-400 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-gray-500 transition-colors hover:bg-rose-400 hover:text-white'
                    onClick={() => remove()}
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  )
}
