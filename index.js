// Copyright 2018 Paul Brewer Economic and Financial Technology Consulting LLC <drpaulbrewer@eaftc.com>
// This software is open source software available under the terms of the MIT License.

// jshint node:true, esversion:6

const arrayUniq = require('array-uniq');
const rainFromGoogleCloud = require('rain-from-google-cloud');

module.exports = function (gce) {

  const rain = rainFromGoogleCloud(gce);

  function up({ prefix, platform } = {}) {
    return function (z) {
      return ((typeof (z) === 'object') &&
        (typeof (z.name) === 'string') &&
        (typeof (z.status) === 'string') &&
        (Array.isArray(z.availableCpuPlatforms)) &&
        (z.status.toUpperCase() === "UP") &&
        ((prefix === undefined) || (z.name.startsWith(prefix))) &&
        ((platform === undefined) || (z.availableCpuPlatforms.includes(platform)))
      );
    };
  }

  function toRegion(z, uniq) {
    const dashLetterEnd = /-.$/;
    if (Array.isArray(z)) {
      const rlist = z.map(x => x.replace(dashLetterEnd, ''));
      return (uniq) ? arrayUniq(rlist) : rlist;
    }
    return z.replace(dashLetterEnd, '');
  }

  function allQuotas({prefix} = {}){
    function addToReport(region){
        const qs = region.quotas;
        quotas[region.name] = {};
        qs.forEach(({metric,limit,usage})=>{
          if (metric && limit && usage)
            quotas[region.name][metric] = {limit, usage};
        });
    }
    const quotas = {};
    if (prefix===undefined) prefix='';
    return (
      rain("Regions", { filter: (r)=>(r.name.startsWith(prefix))})
      .then(regions=>regions.forEach(addToReport))
      .then(()=>(quotas))
    );
  }

  function withQuota({ candidateZones, requirements }) {
    function allowed(qs, requirements){
      function ok(resource,add){
        if (!qs[resource]) return false;
        return ((qs[resource].usage+add)<=(qs[resource].limit));
      }
      return Object.keys(requirements).every((r)=>{
        const additional = requirements[r];
        const pre = 'PREEMPTIBLE_';
        if (r.startsWith(pre)){
          // if a PREEMPTIBLE_X quota exists, it is binding
          if (qs[r] && qs[r].limit) return ok(r, additional);
          // if a PREEMPTIBLE_X quota is zero, ordinary X quota is binding
          return ok(r.replace(pre,''), additional);
        }
        // if the resource does not have a PREEMPTIBLE_ prefix,
        return ok(r, additional);
      });
    }
    if ((requirements === {}) || (requirements === null)) {
      return candidateZones;
    }
    return (
      allQuotas().then(allQs=>(Object.keys(allQs).filter(region=>(allowed(allQs[region],requirements)))))
      .then((allowedRegions) => (candidateZones.filter(z => (allowedRegions.includes(toRegion(z))))))
    );
  }

  function find({ prefix, platform, requirements } = {}) {
    return (
      rain('Zones', {
        filter: up({ prefix, platform }),
        pluck: 'name'
      }).then((zones) => (withQuota({ candidateZones: zones, requirements })))
    );
  }

  return { toRegion, find, withQuota, allQuotas };

};
