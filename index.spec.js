var assert = require('assert');
var fileUpload = require('./index');
var mkdirp = require('mkdirp');
var p = require('path');

describe('file uploader', function() {
  describe('filename suffixes validation', function() {
    it('should be valid when filename ends with .yaml', function() {
        assert.equal(true, fileUpload.validSuffix('a.yaml').status)
    });
  
    it('should be valid when filename ends with .yml', function() {
        assert.equal(true, fileUpload.validSuffix('a.yml').status)
    });

    it('should be valid when filename ends with .json', function() {
        assert.equal(true, fileUpload.validSuffix('a.json').status)
    });

   it('should be invalid when filename not ends with .yaml, .yml or .json', function() {
        assert.equal(false, fileUpload.validSuffix('a.unknown').status)
    });

  });
  
  describe('path finder', function() {
      it('find the file path', function() {
         var obj = fileUpload.metaOf("so/iam/v1", "filename", "/");
         assert.deepEqual([{version: "v1", filename: "filename"}], obj.so.iam);
      });
  });

  describe('filename format validation', function() {
      it('filename should be likes so-iam-v1', function() {
         var value = fileUpload.validFormat('so-iam-v1.yaml');
         assert.equal(true, value.status);
      });
      it('filename should be likes so-iam-v1 otherwise failed', function() {
         var value = fileUpload.validFormat('so-iam.yaml');
         assert.equal(false, value.status);
      });

  });

});

