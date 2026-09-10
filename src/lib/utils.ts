export function formatPrice(price: number, currency: string = 'NGN'): string {
  if (currency === 'NGN') {
    return `\u20A6${price.toLocaleString('en-NG')}`;
  }
  return `${currency} ${price.toLocaleString()}`;
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000_000) {
    return `\u20A6${(price / 1_000_000_000).toFixed(1)}B`;
  }
  if (price >= 1_000_000) {
    return `\u20A6${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `\u20A6${(price / 1_000).toFixed(0)}K`;
  }
  return `\u20A6${price.toLocaleString()}`;
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    houses: 'House',
    estates: 'Estate',
    lands: 'Land',
    plots: 'Plot',
    shops: 'Shop',
    offices: 'Office',
    warehouses: 'Warehouse',
    commercial_buildings: 'Commercial Building',
  };
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    for_sale: 'For Sale',
    for_rent: 'For Rent',
    sold: 'Sold',
    rented: 'Rented',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    for_sale: 'bg-success-100 text-success-700',
    for_rent: 'bg-primary-100 text-primary-700',
    sold: 'bg-neutral-200 text-neutral-600',
    rented: 'bg-neutral-200 text-neutral-600',
  };
  return colors[status] || 'bg-neutral-100 text-neutral-600';
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('ph_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('ph_session_id', sessionId);
  }
  return sessionId;
}
