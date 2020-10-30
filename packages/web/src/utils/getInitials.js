const getInitials = (name = '') => {
  return name
    .replace(/\s+/, ' ')
    .split(' ')
    .slice(0, 2)
    .map((value) => value && value[0].toUpperCase())
    .join('');
};

export default getInitials;
