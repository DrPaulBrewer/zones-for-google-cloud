// jshint node:true, esversion:6 

const arrayUniq = require('array-uniq');
const rainFromGoogleCloud = require('rain-from-google-cloud');

module.exports = function(gce){

    const rain = rainFromGoogleCloud(gce);

    function up({ prefix, platform }={}){
	return function(z){
	    return  ((typeof(z)==='object') &&
		     (typeof(z.name)==='string') &&
		     (typeof(z.status)==='string') &&
		     (Array.isArray(z.availableCpuPlatforms)) &&
		     (z.status.toUpperCase()==="UP") &&
		     ((prefix===undefined) || (z.name.startsWith(prefix))) &&
		     ((platform===undefined) || (z.availableCpuPlatforms.includes(platform)))
		    );
	};
    }

    function toRegion(z, uniq){
	const dashLetterEnd = /-.$/;
	if (Array.isArray(z)) {
	    const rlist = z.map(x=>x.replace(dashLetterEnd,''));
	    return (uniq)? arrayUniq(rlist): rlist;
	}
	return z.replace(dashLetterEnd,'');
    }

    function withQuota({candidateZones, requirements}){
	function hasQuota(region, request){
	    const qs = region.quotas;
	    return Object.keys(request).every((reqMetric)=>{
		const reqAmount = request[reqMetric];
		return qs.some((quotaEntry)=>{
		    return ( (quotaEntry.metric===reqMetric) &&
			     (typeof(quotaEntry.limit)==='number') &&
			     (typeof(quotaEntry.usage)==='number') &&
			     ((quotaEntry.usage+reqAmount) <= quotaEntry.limit)
			   );
		});
	    });
	}
	function allows(requests){
	    return function(region){
		return requests.some(request=>(hasQuota(region,request)));
	    };
	}
	if ((requirements===undefined) || (requirements.length===0)){
	    return candidateZones;
	}
	return (
	    rain("Regions", { filter: allows(requirements), pluck: 'name'})
		.then((allowedRegions)=>(candidateZones.filter(z=>(allowedRegions.includes(toRegion(z))))))
	);
    }

    function find({ prefix, platform, requirements }={}){
	return (
	    rain('Zones', {
		filter: up({prefix,platform}),
		pluck: 'name'
	    }).then((zones)=>(withQuota({candidateZones: zones, requirements})))
	);
    }

    return {toRegion,find,withQuota};
    
};

