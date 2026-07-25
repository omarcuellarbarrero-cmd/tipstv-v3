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
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    

      
{value}
 onChange(e.target.value)}
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
        

          

        

      )}

      {showDropdown && suggestions.length > 0 && (
        

          {suggestions.map((suggestion, index) => (
            
 {
                e.preventDefault()
                handleSelect(suggestion)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {suggestion}
            

          ))}
        

      )}

      {showDropdown && !loading && suggestions.length === 0 && value.trim() && (
        

          No se encontraron sugerencias
        

      )}
    

  )
}