'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export const Dropzone = () => {
  const onDrop = useCallback((file: unknown) => {
    console.log("File dropped: ", file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
  const displayMessage = isDragActive ? 'Drop Here' : 'Drop some file\'s here to see the magic';

  return (
    <div {...getRootProps()} className='cursor-pointer w-[80%] h-[400px] rounded-4xl flex justify-center items-center text-2xl border'>
      <input {...getInputProps()} />
      <p>{displayMessage}</p>
    </div>
  )
}