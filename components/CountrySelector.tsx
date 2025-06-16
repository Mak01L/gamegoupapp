'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import countries from '../data/countries'

interface CountrySelectorProps {
  value: string
  onChange: (country: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CountrySelector({
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: CountrySelectorProps) {
  const { t } = useTranslation('common')

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrar países basado en el término de búsqueda
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredCountries.length
        ) {
          handleSelect(filteredCountries[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (country: string) => {
    onChange(country)
    setIsOpen(false)
    setSearchTerm('')
    setHighlightedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setHighlightedIndex(-1)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setHighlightedIndex(-1)
      }
    }
  }

  const clearSelection = () => {
    onChange('')
    setSearchTerm('')
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  // Scroll al elemento destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && isOpen) {
      const element = document.getElementById(
        `country-option-${highlightedIndex}`
      )
      if (element) {
        element.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  // Use translated placeholder if none provided
  const defaultPlaceholder =
    placeholder || t('misc.selectCountry', 'Selecciona un país')

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`
            bg-neutral-900 border border-violet-700 rounded px-3 py-2 w-full text-white
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
            pr-10
          `}
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          placeholder={defaultPlaceholder}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="country-listbox"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `country-option-${highlightedIndex}`
              : undefined
          }
          role="combobox"
          title="Selector de país"
        />

        {/* Iconos de acción */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {value && !disabled && (
            <button
              type="button"
              className="text-gray-400 hover:text-white mr-1 p-1 rounded"
              onClick={clearSelection}
              aria-label="Limpiar selección"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={`text-gray-400 p-1 rounded ${disabled ? 'cursor-not-allowed' : 'hover:text-white'}`}
            onClick={handleInputClick}
            disabled={disabled}
            aria-label={isOpen ? 'Cerrar lista' : 'Abrir lista'}
          >
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>{' '}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-neutral-800 border border-violet-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCountries.length > 0 ? (
            <ul
              id="country-listbox"
              role="listbox"
              className="py-1"
              title="Lista de países"
            >
              {filteredCountries.map((country, index) => {
                const isSelected = country === value
                return (
                  <li
                    key={country}
                    id={`country-option-${index}`}
                    className={`
                      px-3 py-2 cursor-pointer text-white transition-colors duration-150
                      ${index === highlightedIndex ? 'bg-violet-600' : 'hover:bg-violet-700'}
                      ${isSelected ? 'bg-violet-800 font-semibold' : ''}
                    `}
                    onClick={() => handleSelect(country)}
                    role="option"
                    aria-selected={isSelected}
                    title={country}
                  >
                    {country}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="px-3 py-2 text-gray-400 text-center">
              No se encontraron países
            </div>
          )}
        </div>
      )}
    </div>
  )
}
