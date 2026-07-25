"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (value: string) => void
  field: string
  type?: string
  brand?: string
  modelChassis?: string
  placeholder?: string
  disabled?: boolean
}

export default function Autocomplete({
  value,
  onChange,
  onSelect,
  field,
  type,
  brand,
  modelChassis,
  placeholder = "Escribe para buscar...",
  disabled = false
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: value,
          field,
          ...(type && { type }),
          ...(brand && { brand }),
          ...(modelChassis && { modelChassis }),
        })

        const res = await fetch(`/api/autocomplete?${params.toString()}`)
        const data = await res.json()
        setSuggestions(data.suggestions || [])
        setShowDropdown(true)
        setHighlightedIndex(-1)
      } catch (error) {
        console.error('Error fetching autocomplete:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value, field, type, brand, modelChassis])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setShowDropdown(false)
    onSelect?.(suggestion)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSelect(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        break
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true)
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="h-14 text-lg"
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(suggestion)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="text-lg">{suggestion}</span>
            </div>
          ))}
        </div>
      )}

      {showDropdown && !loading && suggestions.length === 0 && value.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500"
        >
          No se encontraron sugerencias
        </div>
      )}
    </div>
  )
}
