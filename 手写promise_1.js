const PENDING = "pending";
const FULLFILLED = "fullfilled";
const REJECTED = "rejected";
class MyPromise {
  constructor(fn) {
    try {
      fn(this._reslove, this._reject);
    } catch (error) {
      this._reject(error);
    }
  }
  _state = PENDING;
  _value = undefined;
  _reason = undefined;
  successCbs = [];
  failCbs = [];
  _reslove = (value) => {
    if (this._state === PENDING) {
      this._state = FULLFILLED;
      this._value = value;
      while (this.successCbs.length) {
        this.successCbs.shift()(this._value);
      }
    }
  };
  _reject = (reason) => {
    if (this._state === PENDING) {
      this._state = REJECTED;
      this._reason = reason;
      while (this.failCbs.length) {
        this.failCbs.shift()(this._reason);
      }
    }
  };
  then = (successCb, failCb) => {
    successCb ? successCb : (value) => value;
    failCb
      ? failCb
      : (reason) => {
          throw reason;
        };
    return MyPromise((resolve, reject) => {
      if (this._state === FULLFILLED) {
        try {
          let x = successCb(this._value);
          resolvePromise(x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      } else if (this._state === REJECTED) {
        try {
          let y = failCb(this._reason);
          resolvePromise(y, resolve, reject);
        } catch (error) {
          reject(error);
        }
      } else {
        successCb &&
          this.successCbs.push(() => {
            try {
              let x = successCb(this._value);
              resolvePromise(x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        failCb &&
          this.failCbs.push(() => {
            try {
              let y = failCb(this._reason);
              resolvePromise(y, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
      }
    });
  };
  static all(array) {
    let result = [];
    let flag = 0;
    return new MyPromise((resolve, reject) => {
      for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element instanceof MyPromise) {
          element.then(
            (value) => {
              flag++;
              result[index] = value;
              if (flag === array.length) {
                resolve(result);
              }
            },
            (reason) => {
              reject(reason);
            }
          );
        } else {
          flag++;
          result[index] = element;
          if (flag === array.length) {
            resolve(result);
          }
        }
      }
    });
  }
}

function resolvePromise(x, resolve, reject) {
  if (x instanceof MyPromise) {
    x.then(
      (value) => {
        resolve(value);
      },
      (reason) => {
        reject(reason);
      }
    );
  } else {
    resolve(x);
  }
}

new MyPromise();
