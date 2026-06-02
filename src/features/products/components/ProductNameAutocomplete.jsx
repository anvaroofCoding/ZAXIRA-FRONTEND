import { useEffect, useMemo, useState } from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useLazySearchProductsQuery } from '@/features/products/api/productsApi'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { truncateText } from '@/features/products/utils/truncateText'

const filter = createFilterOptions()

const toOption = (product) => ({
  itemKey: product.itemKey,
  name: product.name,
  characteristics: product.characteristics,
  barcode: product.barcode,
  label: product.name,
})

export const ProductNameAutocomplete = ({
  value,
  onNameChange,
  onProductSelect,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value ?? '')
  const debouncedInput = useDebouncedValue(inputValue, 300)
  const [searchProducts, searchState] = useLazySearchProductsQuery()

  useEffect(() => {
    setInputValue(value ?? '')
  }, [value])

  useEffect(() => {
    const query = debouncedInput.trim()
    if (query.length < 1) {
      return
    }
    searchProducts({ q: query, limit: 20 })
  }, [debouncedInput, searchProducts])

  const options = useMemo(
    () => (searchState.data ?? []).map(toOption),
    [searchState.data],
  )

  const selectedOption = useMemo(() => {
    const trimmed = String(value ?? '').trim()
    if (!trimmed) return null
    return options.find((option) => option.name === trimmed) ?? null
  }, [options, value])

  return (
    <Autocomplete
      freeSolo
      disableClearable={false}
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      loading={searchState.isFetching}
      disabled={disabled}
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params)
        const custom = params.inputValue.trim()
        if (
          custom &&
          !filtered.some((option) => option.name.toLowerCase() === custom.toLowerCase())
        ) {
          filtered.push({
            itemKey: `custom:${custom}`,
            name: custom,
            characteristics: '',
            barcode: '',
            label: custom,
            isCustom: true,
          })
        }
        return filtered
      }}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.name || option.label || ''
      }
      isOptionEqualToValue={(option, selected) =>
        option.itemKey === selected.itemKey || option.name === selected.name
      }
      onInputChange={(_event, nextInput, reason) => {
        setInputValue(nextInput)
        if (reason === 'input' || reason === 'clear') {
          onNameChange(nextInput)
        }
      }}
      onChange={(_event, option, reason) => {
        if (reason === 'clear' || !option) {
          onNameChange('')
          return
        }

        if (typeof option === 'string') {
          onNameChange(option)
          return
        }

        onNameChange(option.name)
        if (!option.isCustom && option.characteristics) {
          onProductSelect?.({
            name: option.name,
            characteristics: option.characteristics,
            barcode: option.barcode,
            itemKey: option.itemKey,
          })
        }
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props
        const preview = truncateText(option.characteristics, 80)

        return (
          <Box component="li" key={key} {...rest}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {option.name}
              </Typography>
              {preview.text ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {preview.text}
                </Typography>
              ) : null}
            </Box>
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tovar nomi"
          placeholder="Nomini yozing yoki skladdan tanlang"
        />
      )}
    />
  )
}
