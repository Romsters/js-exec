const repository = require('./repository');
const cacheProvider = require('./cache/redisProvider');
const fileReader = require('../utils/fileReader');
const config = require('../config');

const FILE_NAME = 'filename';
const FILE_CONTENT = 'content';

describe('getByName', () => {
  describe('when filename is empty', () => {
    it('should throw an error', done => {
      repository.getByName().then(() => {
        done(new Error('Promise should not be resolved'));
      }, reason => {
        expect(reason.message).toBe('filename is required');
        done();
      });
    });
  });
  describe('when filename is not empty', () => {
    describe('and file is cached', () => {
      beforeEach(() => {
        spyOn(cacheProvider, 'get').andReturn(Promise.resolve(FILE_CONTENT));
      });
      it('should return cached file', done => {
        repository.getByName(FILE_NAME).then(data => {
          expect(cacheProvider.get).toHaveBeenCalledWith(FILE_NAME);
          expect(data).toBe(FILE_CONTENT);
          done();
        });
      });
    });
    describe('and file is not cached', () => {
      beforeEach(() => {
        spyOn(cacheProvider, 'get').andReturn(Promise.resolve(null));
      });
      describe('and file does not exist in file system', () => {
        beforeEach(() => {
          spyOn(fileReader, 'read').andReturn(Promise.reject('file does not exist'));
        });
        it('should throw error', done => {
          repository.getByName(FILE_NAME).then(() => {
            done(new Error('Promise should not be resolved'));
          }, reason => {
            expect(cacheProvider.get).toHaveBeenCalledWith(FILE_NAME);
            expect(fileReader.read).toHaveBeenCalledWith(`${config.storage.path}/${FILE_NAME}`);
            expect(reason).toBe('file does not exist');
            done();
          });
        });
      });
      describe('and file exists in file system', () => {
        beforeEach(() => {
          spyOn(fileReader, 'read').andReturn(Promise.resolve(FILE_CONTENT));
          spyOn(cacheProvider, 'set');
        });
        it('should throw error', done => {
          repository.getByName(FILE_NAME).then(data => {
            expect(cacheProvider.get).toHaveBeenCalledWith(FILE_NAME);
            expect(fileReader.read).toHaveBeenCalledWith(`${config.storage.path}/${FILE_NAME}`);
            expect(data).toBe(FILE_CONTENT);
            expect(cacheProvider.set).toHaveBeenCalledWith(FILE_NAME, FILE_CONTENT);
            done();
          });
        });
      });
    });
  });
});