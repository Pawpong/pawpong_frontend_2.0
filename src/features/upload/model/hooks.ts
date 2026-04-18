'use client'

import { useMutation } from '@tanstack/react-query'
import {
  uploadRepresentativePhotos,
  uploadParentPetPhoto,
  uploadAvailablePetPhoto,
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
} from '../api'

export const useUploadRepresentativePhotos = () =>
  useMutation({ mutationFn: (files: File[]) => uploadRepresentativePhotos(files) })

export const useUploadParentPetPhoto = () =>
  useMutation({
    mutationFn: ({
      petId,
      file,
      existingPhotos,
    }: {
      petId: string
      file: File
      existingPhotos?: string[]
    }) => uploadParentPetPhoto(petId, file, existingPhotos),
  })

export const useUploadAvailablePetPhoto = () =>
  useMutation({
    mutationFn: ({
      petId,
      file,
      existingPhotos,
    }: {
      petId: string
      file: File
      existingPhotos?: string[]
    }) => uploadAvailablePetPhoto(petId, file, existingPhotos),
  })

export const useUploadSingleFile = () =>
  useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadSingleFile(file, folder),
  })

export const useUploadMultipleFiles = () =>
  useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadMultipleFiles(files, folder),
  })

export const useDeleteFile = () =>
  useMutation({ mutationFn: (fileName: string) => deleteFile(fileName) })
