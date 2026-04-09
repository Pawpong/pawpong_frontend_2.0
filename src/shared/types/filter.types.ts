/**
 * 필터/정렬 옵션 관련 타입 정의
 * 출처: filter-options.ts
 */

export interface FilterOption<T = string> {
  value: T;
  label: string;
  description: string;
}

export type BreederLevelOption = FilterOption<string>;
export type SortOption = FilterOption<string>;
export type DogSizeOption = FilterOption<string>;
export type CatFurLengthOption = FilterOption<string>;
export type AdoptionStatusOption = FilterOption<boolean>;

export interface AllFilterOptions {
  breederLevels: BreederLevelOption[];
  sortOptions: SortOption[];
  dogSizes: DogSizeOption[];
  catFurLengths: CatFurLengthOption[];
  adoptionStatus: AdoptionStatusOption[];
}
