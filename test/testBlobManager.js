/**
 * Created by Eric on 10/9/2015.
 */
var assert = require('chai').assert; //using the chai libraries for all of the assert/expect/should
var BlobManager = require("../blobManager");


function specificFunction(data) {

}
var bm;
describe('BlobManager', function () {

    beforeEach(function () {
            bm = new BlobManager(function (data) {
                specificFunction(data);
            });
        }
    );
    it('should not error when constructed correctly', function () {
        specificFunction = function (data) {
            assert.isOk(false, 'No data should have been sent back when we construct the instance');
        }
    });
    it('should have an empty list in its initial blob list', function () {
        var list = bm.getAllBlobs();
        assert.isArray(list, 'get All blobs should return an array');
        assert.equal(0, list.length, 'the array returned should have length 0');

    });

    describe('put blob', function () {
        describe('put new', function () {
            beforeEach(function (done) {
                specificFunction = function (blob) {
                    assert.deepEqual(newBlob, blob, 'we should get the same blob back');
                    done();
                };
                bm.processBlob(newBlob);
            });
            var newBlob = {cameraID: 1, id: 3, age: 'NEW'};
            it('should return this new blob to us', function (done) {
                //all called in the before method
                done();
            });

            it('should now have a blob in the list', function () {
                assert.isArray(bm.getAllBlobs(), 'we should be returned an array');
                assert.deepEqual(1, bm.getAllBlobs().length, 'we should have a blob in the blob list');
            });

            it('should have new blob in the list', function () {
                assert.deepEqual(1, bm.getAllBlobs().length, 'we should have a blob in the blob list');
                assert.deepEqual(newBlob, bm.getAllBlobs()[0], 'should have newBlob as the only element');
            });

            it('should not overwrite with a second blob', function (done) {
                var otherNewBlob = {cameraID: 7, id: 3, age: 'NEW'};
                specificFunction = function (blob) {
                    assert.deepEqual(otherNewBlob, blob, 'we should get the same blob back');
                    assert.deepEqual(7, blob.cameraID, 'should have a different camera ID');
                    assert.deepEqual(1, newBlob.cameraID);
                    var list = bm.getAllBlobs();
                    assert.isArray(bm.getAllBlobs(), 'we should be returned an array');
                    assert.deepEqual(2, bm.getAllBlobs().length, 'we should have a blob in the blob list');
                    assert.sameDeepMembers(list, [newBlob, otherNewBlob], 'the array should have 2 blobs returned of the blobs previously sent');
                    done();
                };
                bm.processBlob(otherNewBlob);
            })
        });
        describe('send update', function () {
            beforeEach(function (done) {
                specificFunction = function (blob) {
                    assert.deepEqual(updateBlob, blob, 'we should get the same blob back');
                    done();
                };
                bm.processBlob(updateBlob);
            });
            var updateBlob = {cameraID: 1, id: 3, age: 'OLD'};
            it('should return this new blob to us', function (done) {
                specificFunction = function (blob) {
                    assert.deepEqual(updateBlob, blob, 'we should get the same blob back');
                    assert.sameMembers(bm.getAllBlobs(), [updateBlob], 'should have the blob in the getAll blobs list');
                    assert.deepEqual(1, bm.getAllBlobs().length, 'should have a length of 1');
                    done();
                };
                bm.processBlob(updateBlob);
            });
            it('should now have a blob in the list', function () {
                assert.isArray(bm.getAllBlobs(), 'we should be returned an array');
                assert.deepEqual(1, bm.getAllBlobs().length, 'we should have a blob in the blob list');
            });

            it('should have new blob in the list', function () {
                assert.deepEqual(1, bm.getAllBlobs().length, 'we should have a blob in the blob list');
                assert.deepEqual(updateBlob, bm.getAllBlobs()[0], 'should have newBlob as the only element');
            });

            it('should not overwrite with a second blob', function (done) {
                var otherUpdateBlob = {cameraID: 7, id: 3, age: 'OLD'};
                specificFunction = function (blob) {
                    assert.deepEqual(otherUpdateBlob, blob, 'we should get the same blob back');
                    assert.deepEqual(7, blob.cameraID, 'should have a different camera ID');
                    assert.deepEqual(1, updateBlob.cameraID);
                    var list = bm.getAllBlobs();
                    assert.isArray(bm.getAllBlobs(), 'we should be returned an array');
                    assert.deepEqual(2, bm.getAllBlobs().length, 'we should have a blob in the blob list');
                    assert.sameDeepMembers(list, [updateBlob, otherUpdateBlob], 'the array should have 2 blobs returned of the blobs previously sent');
                    done();
                };
                bm.processBlob(otherUpdateBlob);
            })
        });
        describe('send remove', function () {
            beforeEach(function () {
                specificFunction = function (blob) {
                    assert.deepEqual(newBlob, blob, 'we should get the same blob back');
                    specificFunction = function (blob) {
                        assert.deepEqual(removeBlob, blob, 'we should get the same blob back');
                    };
                    bm.processBlob(removeBlob);
                };
                bm.processBlob(newBlob);
            });
            var newBlob = {cameraID: 1, id: 3, age: 'NEW'};
            var removeBlob = {cameraID: 1, id: 3, age: 'LOST'};
            it('should pass the before assertions', function () {
                //before each process is run
            });
            it('should have no blob in the list', function () {
                assert.isArray(bm.getAllBlobs(), 'we should be returned an array');
                assert.deepEqual(0, bm.getAllBlobs().length, 'we should have a blob in the blob list');
            });
            it('should have not have new blob in it', function () {
                assert.equal(-1, bm.getAllBlobs().indexOf(newBlob));
            });
            it('should not have remove blob in it', function () {
                assert.equal(-1, bm.getAllBlobs().indexOf(removeBlob));
            });
            it.skip('may need to do something on rending a remove blob withut the blob being there', function () {
                assert.isOk(false, 'TODO implement');

            })
        })
    })
});