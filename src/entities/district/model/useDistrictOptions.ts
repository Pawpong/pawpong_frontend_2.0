'use client'

import { useQuery } from '@tanstack/react-query'
import { districtQueries } from '../api/district.queries'

const toOption = (name: string) => ({ value: name, label: name })

export function useDistrictOptions(city: string, enabled = true) {
  const { data = [] } = useQuery({ ...districtQueries.list(), enabled })

  return {
    cityOptions: data.map(({ city }) => toOption(city)),
    districtOptions: (data.find((region) => region.city === city)?.districts ?? []).map(toOption),
  }
}
