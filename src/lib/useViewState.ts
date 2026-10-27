import { useEffect, useReducer } from 'react'
import type { EnergyPrices } from './calc.ts'
import { isLanguage, type Language } from './i18n.ts'
import { type Action, fromQuery, initialState, reducer, toQuery, type ViewState } from './state.ts'

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
    window.history.replaceState(null, '', `${window.location.pathname}${toQuery(state)}`)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language)
    // state is the single source: every field it holds belongs in the URL.
  }, [state])

  // A reducer's dispatch is stable, so it needs no useCallback wrapper.
  return [state, rawDispatch]
}

export { initialState }
