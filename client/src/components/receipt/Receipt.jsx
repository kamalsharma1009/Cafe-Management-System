import { forwardRef } from 'react';
import { formatCurrency, formatDateTime, formatToken } from '../../utils/formatters';

const Receipt = forwardRef(({ order, settings }, ref) => {
  const printerWidth = settings?.printerWidth || 80;
  const widthClass = printerWidth === 58 ? 'receipt-58mm' : 'receipt-80mm';

  return (
    <div ref={ref} className={`receipt-paper ${widthClass}`} style={{ fontFamily: 'monospace', fontSize: '12px', padding: '8px', maxWidth: printerWidth === 58 ? '48mm' : '72mm', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        {settings?.logo && (
          <img src={settings.logo} alt="Logo" style={{ width: '60px', margin: '0 auto 4px' }} />
        )}
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{settings?.cafeName || 'CafeFlow'}</div>
        {settings?.address && <div style={{ fontSize: '10px' }}>{settings.address}</div>}
        {settings?.phone && <div style={{ fontSize: '10px' }}>Ph: {settings.phone}</div>}
        {settings?.gstNumber && <div style={{ fontSize: '10px' }}>GST: {settings.gstNumber}</div>}
      </div>

      <div style={{ borderTop: '1px dashed #3A312C', margin: '6px 0' }} />

      {/* Order Info */}
      <div style={{ fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Invoice: {order?.orderNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Token: #{formatToken(order?.token)}</span>
        </div>
        <div style={{ fontSize: '10px' }}>{formatDateTime(order?.createdAt)}</div>
      </div>

      <div style={{ borderTop: '1px dashed #3A312C', margin: '6px 0' }} />

      {/* Items */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #3A312C' }}>
            <th style={{ textAlign: 'left', padding: '2px 0' }}>Item</th>
            <th style={{ textAlign: 'center', padding: '2px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '2px 0' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {order?.items?.map((item, i) => (
            <tr key={i}>
              <td style={{ padding: '2px 0', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.product?.name || 'Item'}
              </td>
              <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '2px 0' }}>
                {formatCurrency(item.price * item.quantity, settings?.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #3A312C', margin: '6px 0' }} />

      {/* Totals */}
      <div style={{ fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>{formatCurrency(order?.subtotal, settings?.currency)}</span>
        </div>
        {parseFloat(order?.discount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount</span>
            <span>-{formatCurrency(order?.discount, settings?.currency)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>GST ({settings?.taxPercentage || 5}%)</span>
          <span>{formatCurrency(order?.gst, settings?.currency)}</span>
        </div>
        <div style={{ borderTop: '1px solid #3A312C', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
          <span>TOTAL</span>
          <span>{formatCurrency(order?.total, settings?.currency)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #3A312C', margin: '6px 0' }} />

      {/* Payment */}
      <div style={{ textAlign: 'center', fontSize: '11px' }}>
        <div>Payment: {order?.paymentMethod}</div>
      </div>

      <div style={{ borderTop: '1px dashed #3A312C', margin: '6px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '11px' }}>
        <div style={{ fontWeight: 'bold' }}>Thank You! Visit Again ☕</div>
        {settings?.receiptFooter && (
          <div style={{ fontSize: '10px', marginTop: '4px' }}>{settings.receiptFooter}</div>
        )}
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
export default Receipt;
