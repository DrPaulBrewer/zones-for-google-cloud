// jshint mocha:true, node:true, esversion:6

const compute = require('@google-cloud/compute')();
const zonesForGoogleCloud = require("../index.js")(compute);
require('should');

describe('zonesForGoogleCloud ', function(){
    it('zonesForGoogleCloud(compute) should be an object', function(){
	zonesForGoogleCloud.should.be.type("object");
    });
    it('should have properties .find,.withQuota,.toRegion ', function(){
	zonesForGoogleCloud.should.have.properties('find','withQuota','toRegion');
    });
    [2,8,64].forEach(n=>{
	it(`should find zones for ${n} CPUS or ${n} PREEMPTIBLE_CPUS with Intel Skylake`, function(){
	    const cpus = { CPUS: n};
	    const precpus = { PREEMPTIBLE_CPUS: n };
	    return (zonesForGoogleCloud
		    .find({platform: 'Intel Skylake', requirements: [cpus,precpus]})
		    .then(zones=>{
			zones.length.should.be.above(1);
			zones.forEach(z=>(z.should.be.type('string')));
		    })
		   );
	});
    });
    it('should not find zones with platform Unobtanium', function(){
	return (zonesForGoogleCloud
		.find({platform: 'Unobtanium'})
		.then(zones=>{
		    zones.length.should.equal(0);
		})
	       );
    });
    it('should find zones in asia', function(){
	return (zonesForGoogleCloud
		.find({prefix: 'asia'})
		.then(zones=>{
		    zones.length.should.be.above(1);
		})
	       );
    });
    it('should not find zones on mars (yet)', function(){
	return (zonesForGoogleCloud
		.find({prefix: 'mars'})
		.then(zones=>{
		    zones.length.should.equal(0);
		})
	       );
    });
});

