'use client'

import { Button, CheckboxInput, useAllFormFields, useForm } from '@payloadcms/ui'
import type React from 'react'
import { useCallback, useMemo } from 'react'

export type CapabilitySection = {
  label: string
  ops: string[]
  path: string
}

const useCapabilityToggles = (paths: string[]) => {
  const [fields, dispatch] = useAllFormFields()
  const { setModified } = useForm()

  const checkedCount = paths.filter((path) => Boolean(fields?.[path]?.value)).length

  const setAll = useCallback(
    (value: boolean) => {
      for (const path of paths) {
        dispatch({ type: 'UPDATE', path, value })
      }
      setModified(true)
    },
    [dispatch, paths, setModified],
  )

  return { checkedCount, setAll }
}

/**
 * Sidebar header for the MCP API key capability sections: shows how many
 * capabilities are enabled across every section and offers bulk
 * select-all / deselect-all.
 */
export const CapabilitiesToolbar: React.FC<{ sections: CapabilitySection[] }> = ({ sections }) => {
  const paths = useMemo(
    () => sections.flatMap((section) => section.ops.map((op) => `${section.path}.${op}`)),
    [sections],
  )
  const { checkedCount, setAll } = useCapabilityToggles(paths)

  return (
    <div className="mcp-capabilities-toolbar">
      <div className="mcp-capabilities-toolbar__meta">
        <span className="mcp-capabilities-toolbar__title">Capabilities</span>
        <span className="mcp-capabilities-toolbar__count">
          {checkedCount} of {paths.length} enabled
        </span>
      </div>
      <div className="mcp-capabilities-toolbar__actions">
        <Button
          buttonStyle="secondary"
          disabled={checkedCount === paths.length}
          onClick={() => setAll(true)}
          size="small"
        >
          Select all
        </Button>
        <Button
          buttonStyle="secondary"
          disabled={checkedCount === 0}
          onClick={() => setAll(false)}
          size="small"
        >
          Deselect all
        </Button>
      </div>
    </div>
  )
}

/**
 * Tri-state "Select all" checkbox rendered at the top of one capability
 * section. Indeterminate when only some operations are enabled; clicking
 * from indeterminate selects the rest.
 */
export const SectionToggleAll: React.FC<{ ops: string[]; section: string }> = ({
  ops,
  section,
}) => {
  const paths = useMemo(() => ops.map((op) => `${section}.${op}`), [ops, section])
  const { checkedCount, setAll } = useCapabilityToggles(paths)
  const allChecked = checkedCount === paths.length

  return (
    <div className="mcp-section-toggle">
      <CheckboxInput
        checked={allChecked}
        id={`mcp-toggle-all-${section}`}
        label="Select all"
        onToggle={() => setAll(!allChecked)}
        partialChecked={checkedCount > 0 && !allChecked}
      />
    </div>
  )
}
