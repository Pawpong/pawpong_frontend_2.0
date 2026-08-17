import type { AdoptionCreateFormValues } from './schema'

type VaccinationRow = AdoptionCreateFormValues['vaccinations'][number]
type GeneticTestRow = AdoptionCreateFormValues['geneticTests'][number]
type ParentRow = AdoptionCreateFormValues['parents'][number]

export const createVaccinationRow = (): VaccinationRow => ({ name: '', date: '', dose: '' })

export const createGeneticTestRow = (): GeneticTestRow => ({
  testName: '',
  result: '',
  date: '',
  institution: '',
})

export const createParentRow = (): ParentRow => ({
  relationship: '',
  name: '',
  breed: '',
  birthDate: '',
})

export const createAdoptionDefaultValues = (): AdoptionCreateFormValues => ({
  name: '',
  breed: '',
  price: '',
  birthDate: '',
  gender: '',
  introduction: '',
  vaccinationStatus: '',
  vaccinationReason: '',
  vaccinations: [createVaccinationRow()],
  geneticTestStatus: '',
  geneticTestReason: '',
  geneticTests: [createGeneticTestRow()],
  parents: [createParentRow()],
  breedingEnvDescription: '',
})
