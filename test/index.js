// jshint mocha:true, node:true, esversion:6

const compute = require('@google-cloud/compute')();
const zonesForGoogleCloud = require("../index.js")(compute);
require('should');

describe('zonesForGoogleCloud ', function(){
    it('zonesForGoogleCloud(compute) should be an object', function(){
	zonesForGoogleCloud.should.be.type("object");
    });
    it('should have properties .find,.withQuota,.toRegion ', function(){
	zonesForGoogleCloud.should.have.properties('find','withQuota','toRegion','allQuotas');
    });
    it('.allQuotas should resolve to at least 10 regions with at least 10 quota props each', function(){
      return (
        zonesForGoogleCloud
          .allQuotas()
          .then(quotas=>{
            Object.keys(quotas).length.should.be.above(10);
            Object.keys(quotas).forEach(region=>(Object.keys(quotas[region]).length.should.be.above(10)));
          })
        );
    });
    [
      {CPUS: 2},
      {CPUS: 8},
      {CPUS: 64},
      {PREEMPTIBLE_CPUS:2},
      {PREEMPTIBLE_CPUS:8},
      {PREEMPTIBLE_CPUS:64}
    ].forEach(req=>{
	it(`should find zones for ${JSON.stringify(req)} with Intel Skylake`, function(){
	    return (zonesForGoogleCloud
		    .find({platform: 'Intel Skylake', requirements: req})
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
