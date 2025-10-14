import { memo } from 'react';

export const USER_SECTION_KEYS = {
  RECENT: 'USERS_RECENT',
  ACTIVE: 'USERS_ACTIVE',
};

export const USER_SECTION_CONFIG = [
  {
    key: USER_SECTION_KEYS.RECENT,
    title: 'RECENTLY JOINED USERS',
    endpoint: '/users?order_by=joined&sort=desc&limit=24',
    previewVariant: 'grid',
    previewCount: 8,
  },
  {
    key: USER_SECTION_KEYS.ACTIVE,
    title: 'RECENTLY ONLINE',
    endpoint: '/users?order_by=last_online&sort=desc&limit=24',
    previewVariant: 'grid',
    previewCount: 8,
  },
];

const UserSections = memo(function UserSections({ renderSection }) {
  if (typeof renderSection !== 'function') {
    return null;
  }

  return USER_SECTION_CONFIG.map((section) => renderSection(section));
});

export default UserSections;
