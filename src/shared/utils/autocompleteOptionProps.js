const INVALID_OPTION_PROPS = new Set([
  'alignItems',
  'ownerState',
  'slotProps',
  'inputProps',
  'InputProps',
])

export const splitAutocompleteOptionProps = (props) => {
  const optionProps = {}

  Object.entries(props).forEach(([key, value]) => {
    if (key === 'key' || INVALID_OPTION_PROPS.has(key)) {
      return
    }
    optionProps[key] = value
  })

  return {
    key: props.key,
    optionProps,
  }
}
