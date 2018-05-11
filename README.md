# zones-for-google-cloud

Extract a list of zones in Google Compute Engine[tm] suitable for starting a particular VM.

You can specify the region of the world (`prefix`), CPU type (`platform`), number of CPUs, disk, or other `requirements`
and get a list of zones that are "UP" where your project has quota meeting these requirements.

Bear in mind that doesn't mean you won't get a ZONE_RESOURCE_POOL_EXHAUSTED or similar error, but since
it returns a list of zones, you can then write your code to retry, do random choice, or temporary blacklisting, or
other techniques to improve success rate on vm launch.

## Installation

  npm i @google-cloud/compute -S
	npm i zones-for-google-cloud -S

## JS Engine Compatiblity

Includes ES6+ code. Intended for deployment on node.js

## Initialization

	const compute = require('@google-cloud/compute')(); // requires credentials when run outside of Google Cloud
	const zonesForGoogleCloud = require('zones-for-google-cloud')(compute);

## Usage

returns Promises

`{...}` is a placeholder for additional code

Resolves to an Array of Strings containing  names of some Google Compute Engine Zones that
are UP, start with us-, support Intel Skylake (required for 64 or 96 cpu VMs), in a region where
you have at least 64 PREEMPTIBLE_CPUS (or CPUS, if PREEMPTIBLE_CPUS quota is undefined) quota

    zonesForGoogleCloud.find({
	   prefix: 'us-',
	   platform: 'Intel Skylake',
	   requirements: { PREEMPTIBLE_CPUS: 64 }
    }).then(...startMyVMInOneOfTheseZones...)

All parameters are optional, in which case you get a list of all zones that are up.

`requirements` is an object, where the keys are Google Cloud Platform regional metrics and the values are the additional
amounts needed. The METRICS ARE ALL CAPS and match the metric names in `gcloud compute region describe us-central1`

## Tests

The [tests](./working-tests.txt) were run on a Google Cloud VM with full access to Google Compute Engine.

Running these tests outside Google Cloud will fail unless appropriate credentials are added to the line initializing `compute`.

### Copyright

Copyright 2018 Paul Brewer, Economic and Financial Technology Consulting LLC

### License

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### No relationship to Google, Inc.

This software is 3rd party software. This software is not a product of Google, Inc.

Google Compute Engine[tm] is a trademark of Google, Inc.
