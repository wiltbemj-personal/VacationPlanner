export function generateId(prefix = 'item') {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
}

export function generateTripCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
