'use client'

import { useQuery } from '@tanstack/react-query'
import { filterQueries } from './Queries'

export const useFilterOptions = () => useQuery(filterQueries.options())
