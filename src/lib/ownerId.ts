const OWNER_ID_KEY = 'topal_owner_id';

export function getOwnerId(): string {
  let ownerId = localStorage.getItem(OWNER_ID_KEY);

  if (!ownerId) {
    ownerId = `owner_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(OWNER_ID_KEY, ownerId);
  }

  return ownerId;
}
