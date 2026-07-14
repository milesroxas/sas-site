'use client'

import { useEffect } from 'react'
import { useHeaderTheme } from '@/providers/HeaderTheme'

export default function PageClient() {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])
  return null
}
