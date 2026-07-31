import { useEffect, useRef } from 'react'
import { COURIER_LABELS, type OutboundOrder, type ShippingLabel } from '@/types/outbound'

export function printShippingLabel(label: ShippingLabel, order?: OutboundOrder | null) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720')
  if (!w) {
    throw new Error('Pop-up blocked — allow pop-ups to print the shipping label')
  }

  const courier = COURIER_LABELS[label.courier] ?? label.courier
  const customer = order?.customerName ?? ''
  const phone = order?.customerPhone ?? ''
  const address = order
    ? `${order.address}, ${order.city}, ${order.state} ${order.pincode}`
    : ''

  w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Label ${label.trackingNumber}</title>
  <style>
    @page { size: 4in 6in; margin: 0.2in; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; }
    .label {
      width: 4in; min-height: 6in; padding: 0.25in;
      border: 2px solid #0f172a; display: flex; flex-direction: column; gap: 12px;
    }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: 0.04em; }
    .meta { font-size: 11px; color: #475569; }
    .order { font-size: 20px; font-weight: 700; }
    .addr { font-size: 13px; line-height: 1.35; }
    .track {
      margin-top: auto; text-align: center; border-top: 1px dashed #94a3b8; padding-top: 12px;
    }
    .barcode { font-family: ui-monospace, monospace; font-size: 16px; letter-spacing: 0.12em; font-weight: 700; }
    .qr {
      width: 96px; height: 96px; margin: 8px auto; background: #0f172a; color: #fff;
      display: flex; align-items: center; justify-content: center; font-size: 10px; text-align: center;
    }
    .tn { font-family: ui-monospace, monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div class="label">
    <div class="brand">UPBOX</div>
    <div class="meta">${courier} · Shipping label</div>
    <div class="order">${label.orderNumber}</div>
    ${customer ? `<div class="addr"><strong>${customer}</strong>${phone ? `<br/>${phone}` : ''}<br/>${address}</div>` : ''}
    <div class="track">
      <div class="barcode">${label.barcode}</div>
      <div class="qr">QR<br/>mock</div>
      <div class="tn">${label.trackingNumber}</div>
    </div>
  </div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`)
  w.document.close()
}

/** Hidden host kept for React callers that want to preview before print */
export function ShippingLabelPrintPreview(props: {
  label: ShippingLabel
  order?: OutboundOrder | null
  autoPrint?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (props.autoPrint) {
      try {
        printShippingLabel(props.label, props.order)
      } catch {
        /* ignore */
      }
    }
  }, [props.autoPrint, props.label, props.order])

  return (
    <div ref={ref} className="sr-only" aria-hidden>
      {props.label.trackingNumber}
    </div>
  )
}
