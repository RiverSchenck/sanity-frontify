import {Button, Flex, Text} from '@sanity/ui'
import type {ComponentType, CSSProperties, SVGProps} from 'react'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

type Props = {
  icon: Icon
  label: string
  caption?: string
  onClick: () => void
}

const OVERLAY: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
}

export function MediaOverlay({icon, label, caption, onClick}: Props) {
  return (
    <Flex align="center" justify="center" direction="column" gap={3} style={OVERLAY}>
      <span style={{pointerEvents: 'auto'}}>
        <Button
          icon={icon}
          mode="ghost"
          fontSize={4}
          padding={4}
          radius="full"
          aria-label={label}
          onClick={onClick}
        />
      </span>
      <Text size={1} muted style={{minHeight: '1.25em', visibility: caption ? 'visible' : 'hidden'}}>
        {caption || '\u00a0'}
      </Text>
    </Flex>
  )
}
