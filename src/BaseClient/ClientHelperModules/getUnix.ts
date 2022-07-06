export default (ID: string) => {
  const variable = BigInt(ID);
  const id = BigInt.asUintN(64, variable);
  const dateBits = Number(id >> 22n);
  const unix = dateBits + 1420070400000;
  return unix;
};
