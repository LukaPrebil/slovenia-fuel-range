import { useCallback, useEffect, useReducer } from 'react'
import type { EnergyPrices } from './calc.ts'
import { isLanguage, type Language } from './i18n.ts'
import { fromQuery, initialState, reducer, toQuery, type Action, type ViewState } from './state.ts'

export const LANGUAGE_STORAGE_KEY = 'fuel-range-language'

function storedLanguage(): Language {
  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return isLanguage(value) ? value : 'sl'
}

export function useViewState(defaults: EnergyPrices): [ViewState, (action: Action) => void] {
  const [state, rawDispatch] = useReducer(
    (current: ViewState, action: Action) => reducer(current, action, defaults),
    undefined,
    () => fromQuery(window.location.search, defaults, storedLanguage()),
  )

  useEffect(() => {
    const query = toQuery(state)
    window.history.replaceState(null, '', `${window.location.pathname}${query}`)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language)
  }, [state])

  const dispatch = useCallback((action: Action) => rawDispatch(action), [rawDispatch])
  return [state, dispatch]
}

export { initialState }
