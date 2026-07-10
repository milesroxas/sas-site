'use client'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/utilities/useDebounce'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Field>
          <FieldLabel className="sr-only" htmlFor="search">
            Search
          </FieldLabel>
          <Input
            id="search"
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder="Search"
          />
        </Field>
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
