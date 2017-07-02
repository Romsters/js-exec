const cacheProvider = require('./redisProvider');

const KEY = 'key';
const VALUE = 'value';

describe('get', () => {
  describe('when key is not a string', done => {
    it('should throw an error', done => {
      cacheProvider.get().then(() => {
        done(new Error('Promise should not be resolved'));
      }, reason => {
        expect(reason).toBe('key is not a string');
        done();
      });
    });
  });
  describe('when key is string', () => {
    describe('and getting value throws error', () => {
      beforeEach(() => {
        spyOn(cacheProvider, '_get').andReturn(Promise.reject('something went wrong'));
      });
      it('should throw up the same error', done => {
        cacheProvider.get(KEY).then(() => {
          done(new Error('Promise should not be resolved'));
        }, reason => {
          expect(cacheProvider._get).toHaveBeenCalledWith(KEY);
          expect(reason).toBe('something went wrong');
          done();
        });
      });
    });
    describe('and value got from cache', () => {
      beforeEach(() => {
        spyOn(cacheProvider, '_get').andReturn(Promise.resolve(VALUE));
      });
      it('should return value', done => {
        cacheProvider.get(KEY).then(data => {
          expect(cacheProvider._get).toHaveBeenCalledWith(KEY);
          expect(data).toBe(VALUE);
          done();
        });
      });
    });
  });
});

describe('set', () => {
  describe('when key is not a string', () => {
    it('should throw an error', () => {
      expect(() => cacheProvider.set()).toThrow(new Error('key is not a string'));
    });
  });
  describe('when key is string', () => {
    beforeEach(() => {
      spyOn(cacheProvider.client, 'set');
    });
    it('should set value', () => {
      cacheProvider.set(KEY, VALUE);
      expect(cacheProvider.client.set).toHaveBeenCalledWith(KEY, VALUE);
    });
    describe('when expire parameter is provided and is number', () => {
      beforeEach(() => {
        spyOn(cacheProvider.client, 'expire');
      });
      it('should set expire', () => {
        cacheProvider.set(KEY, VALUE, 255);
        expect(cacheProvider.client.expire).toHaveBeenCalledWith(KEY, 255);
      });
    });
  });
});

describe('remove', () => {
  describe('when key is not a string', () => {
    it('should throw an error', () => {
      expect(() => cacheProvider.remove()).toThrow(new Error('key is not a string'));
    });
  });
  describe('when key is string', () => {
    beforeEach(() => {
      spyOn(cacheProvider.client, 'del');
    });
    it('should set expire', () => {
      cacheProvider.remove(KEY);
      expect(cacheProvider.client.del).toHaveBeenCalledWith(KEY);
    });
  });
});