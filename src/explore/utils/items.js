export const getItemKey = (item, index, prefix = 'item') => {
  if (item?.mal_id != null) {
    return item.mal_id.toString();
  }
  if (item?.username) {
    return `user-${item.username}`;
  }
  if (item?.name) {
    return `name-${item.name}-${index}`;
  }
  return `${prefix}-${index}`;
};
