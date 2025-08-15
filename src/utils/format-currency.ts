export const convertToCents = (amount: number) => {
  return Math.round(amount * 100);
};

export const convertToDollarUnit = (amount: number) => {
  return amount / 100;
};
