module.exports = function querablePromise(promise) {
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;

  const result = promise.then(
    v => {
      isFulfilled = true;
      isPending = false;
      return v;
    },
    e => {
      isRejected = true;
      isPending = false;
      throw e;
    }
  );

  result.isFulfilled = () => isFulfilled;
  result.isPending = () => isPending;
  result.isRejected = () => isRejected;
  return result;
};