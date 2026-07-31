import type { ReactNode } from 'react'
import { OutboundFlowStrip } from '@/components/enterprise/OutboundFlowStrip'
import { OutboundStepGuide } from '@/components/enterprise/OutboundStepGuide'
import { useOutboundFlowSummary } from '@/hooks/useOutbound'

export function OutboundChrome(props: {
  what: string
  doNow: string
  nextLabel?: string
  nextTo?: string
  children: ReactNode
}) {
  const summaryQ = useOutboundFlowSummary()
  return (
    <>
      <OutboundFlowStrip summary={summaryQ.data} />
      <OutboundStepGuide
        what={props.what}
        doNow={props.doNow}
        nextLabel={props.nextLabel}
        nextTo={props.nextTo}
      />
      {props.children}
    </>
  )
}
