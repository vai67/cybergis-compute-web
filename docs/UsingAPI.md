# Using the CyberGIS-Compute API

Basic demo: https://github.com/cybergis/cybergis-compute-web

Demo web app: https://cybergis.github.io/cybergis-compute-web/

CyberGIS-Compute Server Base URL: https://cgjobsup-test.cigi.illinois.edu/v2/

**Note:** We will ask web apps to move to our production server (https://cgjobsup.cigi.illinois.edu/v2/) once the required changes have been deployed there.

Swagger Docs: https://cgjobsup-test.cigi.illinois.edu/v2/api-docs/ 

## Authentication

Authentication uses tokens that you can request from the CyberGIS Center.

To verify that your token is working and/or recieve your CyberGIS-Compute username, you can use the `/user` route:

```
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/user',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({"jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE"})
      })
```

## Submitting a Job

**Note:** Data upload through the browser is still being developed.

There are a few steps required to submit a job.

1. POST /job - to create the job object in the backend and get an ID
2. PUT /job/:id - to set the data for the Job object
3. POST /upload - to upload data that will used with the corresponding job (ID passed in formdata)
4. POST /job/:id/submit - to tell the backend the job should be submitted

It is likely that you want to call all three routes in succession when an end-user wants to submit a job.

#### POST /job

This creates the Job object and gives you can ID for interacting with the job. Example:

```
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            'maintainer': "community_contribution",
            "jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE",
            "hpc": selectedHpc ? selectedHpc : "keeling_community"
          }
        )
      })
```

#### PUT /job/:id

This sets the details of the job. Example:

```
  await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID,
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE",
            "localExecutableFolder": {"type": "git", "gitId": "herop_spatial_access"},
            "slurm": {"time": "30:00", "memory": "16GB"},
            "param": {
              "mobility_mode": "DRIVING",
              "population_type": "ZIP",
              "max_travel_time": "30",
              "access_measure": "ALL",
              "supply_filename": "supply/ContinentalHospitals.shp",
              "supply_capacity": "BEDS",
              "supply_latlon_or_id": "ID",
              "supply_id": "ZIP",
              "supply_lat": "",
              "supply_lon": ""
            },
          }
        )
      })
```

#### POST /upload

(Optional) You can upload data directly from the browser to be used as input data with a corresponding job. Example:

```
if (file !== null) {
      const formData = new FormData()
      formData.append("jupyterhubApiToken", token_dict["jupyterhubApiToken"]);
      formData.append("jobId", jobID);
      formData.append("file", file);
      // upload
      await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/upload', {
        method: "POST",
        body: formData
      });
    }
```

#### POST /job/:id/submit

Lastly, you want to submit the job. Example:

```
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID + '/submit',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({"jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE"})
      })
```

## Monitoring the Job

You can get a job's status using the POST /job/:id route. Example:

**Note:** You need to repeatedly query this, it is not a webhook. We are working to re-implement this route as a webhook. Please wait a second or more between queries to not overwhelm the Core server.

```
await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE"})
        })
```

This route returns a large JSON dictionary with a variety of information about the job. You will know the job is complete when the "finishedAt" field is no longer null.

```
{
  "id": "1745852151TqPs8",
  "userId": "alexandermichels@cybergisx.cigi.illinois.edu",
  "name": null,
  "maintainer": "community_contribution",
  "hpc": "keeling_community",
  "remoteExecutableFolder": {
    "id": "1745852155PJYxn",
    "name": null,
    "hpc": "keeling_community",
    "hpcPath": "/data/keeling/a/cigi-gisolve/scratch/1745852155PJYxn",
    "globusPath": "/1745852155PJYxn",
    "userId": "alexandermichels@cybergisx.cigi.illinois.edu",
    "isWritable": false,
    "createdAt": "2025-04-28T14:55:57.540Z",
    "updatedAt": null,
    "deletedAt": null
  },
  "remoteDataFolder": null,
  "remoteResultFolder": {
    "id": "1745852158f8NuN",
    "name": null,
    "hpc": "keeling_community",
    "hpcPath": "/data/keeling/a/cigi-gisolve/scratch/1745852158f8NuN",
    "globusPath": "/1745852158f8NuN",
    "userId": "alexandermichels@cybergisx.cigi.illinois.edu",
    "isWritable": false,
    "createdAt": "2025-04-28T14:55:58.154Z",
    "updatedAt": null,
    "deletedAt": null
  },
  "localExecutableFolder": {
    "type": "git",
    "gitId": "herop_spatial_access"
  },
  "localDataFolder": null,
  "param": {
    "mobility_mode": "DRIVING",
    "population_type": "ZIP",
    "max_travel_time": "30",
    "access_measure": "ALL",
    "supply_filename": "supply/ContinentalHospitals.shp",
    "supply_capacity": "BEDS",
    "supply_latlon_or_id": "ID",
    "supply_id": "ZIP",
    "supply_lat": "",
    "supply_lon": ""
  },
  "env": {},
  "slurm": {
    "time": "30:00",
    "memory": "16GB"
  },
  "slurmId": "9452091",
  "credentialId": null,
  "events": [
    {
      "id": 15475,
      "jobId": "1745852151TqPs8",
      "type": "JOB_QUEUED",
      "message": "job [1745852151TqPs8] is queued, waiting for registration",
      "createdAt": "2025-04-28T14:55:51.666Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15476,
      "jobId": "1745852151TqPs8",
      "type": "JOB_REGISTERED",
      "message": "job [1745852151TqPs8] is registered with the supervisor, waiting for initialization",
      "createdAt": "2025-04-28T14:55:53.472Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15477,
      "jobId": "1745852151TqPs8",
      "type": "SLURM_UPLOAD_EXECUTABLE",
      "message": "uploading executable folder",
      "createdAt": "2025-04-28T14:56:00.078Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15478,
      "jobId": "1745852151TqPs8",
      "type": "SSH_SCP_UPLOAD",
      "message": "put file from /job_supervisor/data/root/herop_spatial_access.zip to /data/keeling/a/cigi-gisolve/scratch/cache/herop_spatial_access.zip",
      "createdAt": "2025-04-28T14:56:00.086Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15479,
      "jobId": "1745852151TqPs8",
      "type": "SSH_UNZIP",
      "message": "unzipping /data/keeling/a/cigi-gisolve/scratch/cache/herop_spatial_access.zip to /data/keeling/a/cigi-gisolve/scratch/1745852155PJYxn",
      "createdAt": "2025-04-28T14:56:00.094Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15480,
      "jobId": "1745852151TqPs8",
      "type": "SLURM_CREATE_RESULT",
      "message": "create result folder",
      "createdAt": "2025-04-28T14:56:00.103Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15481,
      "jobId": "1745852151TqPs8",
      "type": "SSH_MKDIR",
      "message": "removing /data/keeling/a/cigi-gisolve/scratch/1745852158f8NuN/slurm_log",
      "createdAt": "2025-04-28T14:56:00.112Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15482,
      "jobId": "1745852151TqPs8",
      "type": "SSH_SCP_UPLOAD",
      "message": "put file from /job_supervisor/data/tmp/tmp-no2vdssoo7 to /data/keeling/a/cigi-gisolve/scratch/1745852155PJYxn/job.sbatch",
      "createdAt": "2025-04-28T14:56:00.122Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15483,
      "jobId": "1745852151TqPs8",
      "type": "SSH_CREATE_FILE",
      "message": "create file to /data/keeling/a/cigi-gisolve/scratch/1745852155PJYxn/job.json",
      "createdAt": "2025-04-28T14:56:00.129Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15484,
      "jobId": "1745852151TqPs8",
      "type": "SSH_SCP_UPLOAD",
      "message": "put file from /job_supervisor/data/tmp/tmp-oiwpt78e5j to /data/keeling/a/cigi-gisolve/scratch/1745852155PJYxn/job.json",
      "createdAt": "2025-04-28T14:56:00.136Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15485,
      "jobId": "1745852151TqPs8",
      "type": "SLURM_SUBMIT",
      "message": "submitting slurm job",
      "createdAt": "2025-04-28T14:56:00.144Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15486,
      "jobId": "1745852151TqPs8",
      "type": "SLURM_SUBMIT_SUCCESS",
      "message": "slurm job submitted with slurm job id 9452091",
      "createdAt": "2025-04-28T14:56:00.152Z",
      "updatedAt": null,
      "deletedAt": null
    },
    {
      "id": 15487,
      "jobId": "1745852151TqPs8",
      "type": "JOB_INIT",
      "message": "job [1745852151TqPs8] is initialized, waiting for job completion",
      "createdAt": "2025-04-28T14:56:00.164Z",
      "updatedAt": null,
      "deletedAt": null
    }
  ],
  "logs": [],
  "createdAt": "2025-04-28T14:55:51.493Z",
  "updatedAt": null,
  "deletedAt": null,
  "initializedAt": "2025-04-28T14:56:00.157Z",
  "finishedAt": null,
  "queuedAt": "2025-04-28T14:55:51.675Z",
  "isFailed": false,
  "nodes": null,
  "cpus": null,
  "cpuTime": null,
  "memory": null,
  "memoryUsage": null,
  "walltime": null
}
```

## Downloading Job Results

You can download the results of a job through the browser using the POST /folder/:folderID/download/browser route. The body requires:

* "jupyterhubApiToken": Authentication token 
* "jobId": the ID of the job
* "folderId": the ID of the folder you would like to download. You can get this field from the job status dictionary using `jobStatusResponse['remoteResultFolder']['id']` (NOTE: jobStatusResponse here is the status request response).

Example:

```
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/folder/' + downloadID + '/download/browser',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "jupyterhubApiToken": "YOUR_TOKEN_GOES_HERE",
            "jobId": jobID,
            "folderId": downloadID
          }
        )
      })
      .then(async function (response) {
        if (response.status !== 200) {
          console.log(
            'Looks like there was a problem. Status Code: ' + response.status
          );
          return;
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = 'result.zip';
        link.click();
        URL.revokeObjectURL(objectUrl);
      })
```