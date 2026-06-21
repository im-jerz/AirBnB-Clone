import { formatPHP } from "../../utils/formatCurrency";

export default function PriceBreakdown({ price, nights }) {
  const p = price;
  return (
    <div className="price-summary-box">
      <div className="price-summary-row">
        <span>{formatPHP(p.base_price)} × {nights} night{nights !== 1 ? "s" : ""}</span>
        <span>{formatPHP(p.base_price * nights)}</span>
      </div>
      {p.cleaning_fee ? (
        <div className="price-summary-row">
          <span>Cleaning fee</span>
          <span>{formatPHP(p.cleaning_fee)}</span>
        </div>
      ) : null}
      {p.service_fee ? (
        <div className="price-summary-row">
          <span>Guest service fee</span>
          <span>{formatPHP(p.service_fee)}</span>
        </div>
      ) : null}
      <div className="price-summary-row total">
        <span>Guest total</span>
        <span>{formatPHP(p.total_price)}</span>
      </div>
      <div className="price-summary-row deduction">
        <span>Platform commission ({p.commission_rate}%)</span>
        <span>−{formatPHP(p.commission_amount)}</span>
      </div>
      <div className="price-summary-row payout">
        <span>Your payout</span>
        <span>{formatPHP(p.host_payout)}</span>
      </div>
    </div>
  );
}