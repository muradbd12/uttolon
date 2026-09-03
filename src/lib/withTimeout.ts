/**
 * Wraps a promise with a timeout. If the promise doesn't settle within `ms`
 * milliseconds, the returned promise rejects so the caller can show an error
 * instead of hanging forever (e.g. on a dead/slow network).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number = 15000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
