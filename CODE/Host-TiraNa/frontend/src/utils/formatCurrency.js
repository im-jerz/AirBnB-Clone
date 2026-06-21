export function formatPHP(amount) {
  const n = Number(amount) || 0;
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPHPDecimal(amount) {
  const n = Number(amount) || 0;
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}