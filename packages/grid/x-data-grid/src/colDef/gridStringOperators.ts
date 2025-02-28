import { GridFilterInputValue } from '../components/panel/filterPanel/GridFilterInputValue';
import { escapeRegExp } from '../utils/utils';
import type { GridApplyQuickFilterV7 } from '../models/colDef/gridColDef';
import { GridFilterItem } from '../models/gridFilterItem';
import { GridFilterOperator } from '../models/gridFilterOperator';
import { GridFilterInputMultipleValue } from '../components/panel/filterPanel/GridFilterInputMultipleValue';
import { convertLegacyOperators, tagInternalFilter } from './utils';

export const getGridStringQuickFilterFn = tagInternalFilter(
  (value: any): GridApplyQuickFilterV7 | null => {
    if (!value) {
      return null;
    }
    const filterRegex = new RegExp(escapeRegExp(value), 'i');
    return (columnValue): boolean => {
      return columnValue != null ? filterRegex.test(columnValue.toString()) : false;
    };
  },
);

export const getGridStringOperators = (
  disableTrim: boolean = false,
): GridFilterOperator<any, number | string | null, any>[] =>
  convertLegacyOperators([
    {
      value: 'contains',
      getApplyFilterFnV7: (filterItem: GridFilterItem) => {
        if (!filterItem.value) {
          return null;
        }
        const filterItemValue = disableTrim ? filterItem.value : filterItem.value.trim();

        const filterRegex = new RegExp(escapeRegExp(filterItemValue), 'i');
        return (value): boolean => {
          return value != null ? filterRegex.test(String(value)) : false;
        };
      },
      InputComponent: GridFilterInputValue,
    },
    {
      value: 'equals',
      getApplyFilterFnV7: (filterItem: GridFilterItem) => {
        if (!filterItem.value) {
          return null;
        }
        const filterItemValue = disableTrim ? filterItem.value : filterItem.value.trim();

        const collator = new Intl.Collator(undefined, { sensitivity: 'base', usage: 'search' });
        return (value): boolean => {
          return value != null ? collator.compare(filterItemValue, value.toString()) === 0 : false;
        };
      },
      InputComponent: GridFilterInputValue,
    },
    {
      value: 'startsWith',
      getApplyFilterFnV7: (filterItem: GridFilterItem) => {
        if (!filterItem.value) {
          return null;
        }
        const filterItemValue = disableTrim ? filterItem.value : filterItem.value.trim();

        const filterRegex = new RegExp(`^${escapeRegExp(filterItemValue)}.*$`, 'i');
        return (value): boolean => {
          return value != null ? filterRegex.test(value.toString()) : false;
        };
      },
      InputComponent: GridFilterInputValue,
    },
    {
      value: 'endsWith',
      getApplyFilterFnV7: (filterItem: GridFilterItem) => {
        if (!filterItem.value) {
          return null;
        }
        const filterItemValue = disableTrim ? filterItem.value : filterItem.value.trim();

        const filterRegex = new RegExp(`.*${escapeRegExp(filterItemValue)}$`, 'i');
        return (value): boolean => {
          return value != null ? filterRegex.test(value.toString()) : false;
        };
      },
      InputComponent: GridFilterInputValue,
    },
    {
      value: 'isEmpty',
      getApplyFilterFnV7: () => {
        return (value): boolean => {
          return value === '' || value == null;
        };
      },
      requiresFilterValue: false,
    },
    {
      value: 'isNotEmpty',
      getApplyFilterFnV7: () => {
        return (value): boolean => {
          return value !== '' && value != null;
        };
      },
      requiresFilterValue: false,
    },
    {
      value: 'isAnyOf',
      getApplyFilterFnV7: (filterItem: GridFilterItem) => {
        if (!Array.isArray(filterItem.value) || filterItem.value.length === 0) {
          return null;
        }
        const filterItemValue = disableTrim
          ? filterItem.value
          : filterItem.value.map((val) => val.trim());
        const collator = new Intl.Collator(undefined, { sensitivity: 'base', usage: 'search' });

        return (value): boolean =>
          value != null
            ? filterItemValue.some((filterValue: GridFilterItem['value']) => {
                return collator.compare(filterValue, value.toString() || '') === 0;
              })
            : false;
      },
      InputComponent: GridFilterInputMultipleValue,
    },
  ]);
