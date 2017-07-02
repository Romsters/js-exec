const runner = require('./runner');
const repository = require('../storage/repository');
const vmFactory = require('./vmFactory');

const FILE_NAME = 'filename';
const vm = {
  run() {
  }
};

describe('runCodeFromFile', () => {
  describe('when filename is empty', () => {
    it('should throw an error', done => {
      runner.runCodeFromFile().then(() => {
        done(new Error('Promise should not be resolved'));
      }, reason => {
        expect(reason.message).toBe('filename is required');
        done();
      });
    });
  });
  describe('when filename is not empty', () => {
    describe('and getting code from repository throws an error', () => {
      beforeEach(() => {
        spyOn(repository, 'getByName').andReturn(Promise.reject('something went wrong'));
      });
      it('should throw up the same error', done => {
        runner.runCodeFromFile(FILE_NAME).then(() => {
          done(new Error('Promise should not be resolved'));
        }, reason => {
          expect(repository.getByName).toHaveBeenCalledWith(FILE_NAME);
          expect(reason).toBe('something went wrong');
          done();
        });
      });
    });
    describe('and code got from repository', () => {
      beforeEach(() => {
        spyOn(repository, 'getByName').andReturn(Promise.resolve('code'));
        spyOn(vmFactory, 'createDefaultVM').andReturn(vm);
      });
      describe('and code throws an error', () => {
        beforeEach(() => {
          spyOn(vm, 'run').andThrow('I am error');
        });
        it('should return error', done => {
          runner.runCodeFromFile(FILE_NAME).then(result => {
            expect(vmFactory.createDefaultVM).toHaveBeenCalled();
            expect(vm.run).toHaveBeenCalledWith('code');
            expect(result).toBe('Error, I am error');
            done();
          });
        });
      });
      describe('and code returns result', () => {
        beforeEach(() => {
          spyOn(vm, 'run').andReturn('result');
        });
        it('should return result', done => {
          runner.runCodeFromFile(FILE_NAME).then(result => {
            expect(vmFactory.createDefaultVM).toHaveBeenCalled();
            expect(vm.run).toHaveBeenCalledWith('code');
            expect(result).toBe('result');
            done();
          });
        });
      });
    });
  });
});