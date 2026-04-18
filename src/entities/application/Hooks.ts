'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { applicationQueries } from './Queries'

export const useMyApplications = (animalType?: 'cat' | 'dog', limit?: number) =>
  useInfiniteQuery(applicationQueries.myList(animalType, limit))

export const useApplicationDetail = (applicationId: string) =>
  useQuery(applicationQueries.detail(applicationId))

export const useApplicationForm = () => useQuery(applicationQueries.form())
