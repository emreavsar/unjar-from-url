'use strict';

var expect = require('chai').expect;
var unjar = require('../index');

describe('#unjar', function() {
    it('should download the file', function() {
        var result = unjar([{
            "dirToPut": "myurl.jar"
        }]);
        expect(result).to.equal(1);
    });
});