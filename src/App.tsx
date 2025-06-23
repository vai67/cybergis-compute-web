import { useState, useEffect, ChangeEvent } from 'react'
import './App.css'
import { TabList, TabPanel, Tab, Tabs, TabPanels, ChakraProvider, Box, Heading, Text, Select, Input, Checkbox, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from '@chakra-ui/react';
import { AnnouncementType, ListData } from './types';
import Loading from './Loading';
import React from 'react';


const token_dict = {"jupyterhubApiToken": import.meta.env.VITE_COMPUTE_TOKEN};
var jobID = "";
var downloadID = "";
// console.log(token_dict);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const getInitialRender = async (): Promise<ListData | undefined> => {
  try {
    // 'http://127.0.0.1:5000/'
    console.log("Authenticating...")
    var username = "";
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/user',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(token_dict)
      })
      .then(resp => resp.json())
      .then(data => {console.log(data); username = data["username"];})
      .then(err => {console.log(err)});
    console.log("Username is ", username);

    var announcements: AnnouncementType[] = [];
    var jobsKeys: string[] = [];
    var hpcsKeys: string[] = [];
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/announcement', {method: "GET"})
      .then(resp => resp.json())
      .then(data => {console.log(data); announcements = data["announcements"];})
      .then(err => {console.log(err)});
    
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/git', {method: "GET"})
      .then(resp => resp.json())
      .then(data => {console.log(data); jobsKeys = Object.keys(data["git"]);})
      .then(err => {console.log(err)});

    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/hpc', {method: "GET"})
    .then(resp => resp.json())
    .then(data => {console.log(data); hpcsKeys = Object.keys(data["hpc"]);})
    .then(err => {console.log(err)});

    return {"data": {"announcements": announcements, "jobsKeys": jobsKeys, "hpcsKeys": hpcsKeys}};
  } catch (error) {
    //alert('Failed to fetch data: ' + error)
    console.error('Fetch error: ', error)
    return undefined;
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  // const [jobs, setJobs] = useState<JobType[]>([]);
  // const [hpcs, setHpcs] = useState<HpcType[]>([]);
  // const [selectedJob, setSelectedJob] = useState<JobType | null>(null);
  // const [selectedHpc, setSelectedHpc] = useState<HpcType | null>(null);
  const [jobs, setJobs] = useState<string[]>([]);
  const [hpcs, setHpcs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedHpc, setSelectedHpc] = useState<string | null>(null);
  const [jobName, setJobName] = useState<string>('');
  const [submissionResponse, setSubmissionResponse] = useState<string>('');
  const [jobFinished, setJobFinished] = useState<string>('');
  const [jobOutput, setJobOutput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  //Task 3
  const [params, setParams] = React.useState({
    mobility_mode: "",
    population_type: "",
    max_travel_time: "",
    access_measure: "",
    supply_filename: "",
    supply_capacity: "",
    supply_latlon_or_id: "",
    supply_id: "",
    supply_lat: "",
    supply_lon: ""
  });

  //Task 4
  const [slurmParams, setSlurmParams] = React.useState({
    time: "",
    memory: "",
  });
  
  

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  // Code to load data from flask backend at start
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const listData: ListData | undefined = await getInitialRender();
      const listDataElements = listData!.data;
      if (listData) {
        console.log(36, "Obtained data: \n", JSON.stringify(listData));

        // Assuming listData contains 'announcements', 'jobs', and 'hpcs' directly
        setAnnouncements(listDataElements.announcements);
        setJobs(listDataElements.jobsKeys);
        setHpcs(listDataElements.hpcsKeys);
      } else {
        console.error("Failed to fetch list data.");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  // Code for announcements component
  const Announcements = () => {
    console.log("Rendering announcements: ", announcements);
    return (
      announcements.map((announcement, index) => {
        return(
          <Box key={index} className="border p-4 text-left">
            <Text className="font-semibold mb-2">
              Message {index + 1}:
            </Text>
            <Text>
              Message: {announcement.message}
            </Text>
            <Text className="text-left">
              Posted by: {announcement.poster} at {announcement.time_stamp}
            </Text>
          </Box>
          );
      })
    );
  };

  //Task 2 
  const jobToHpcMap: { [key: string]: string[] } = {
    "wrfhydro-5.x": ["keeling_community", "expanse_community", "anvil_community"],
    "WRFHydro_Postprocess" : ["anvil_community"],
    "Watershed_DEM_Raster_Connector" : ["anvil_community"],
    "three-examples" : ["anvil_community", "expanse_community", "keeling_community", "rails_community"],
    "summa3" : ["keeling_community", "expanse_community"],
    "Subset_AORC_Forcing_Data_Processor" : ["anvil_community"],
    "SimpleDataProc_Processor" : ["anvil_community"],
    "SimpleDataClean_Processor" : ["anvil_community"],
    "simple-g" : ["anvil_community"],
    "pysal-access" : ["anvil_community", "expanse_community", "keeling_community"],
    "population_vulnerable_to_dam_failure" : ["anvil_community", "keeling_community"],
    "mpi-test" : ["keeling_community", "expanse_community", "anvil_community"],
    "herop_spatial_access" : ["keeling_community"],
    "hello_world" : ["aces_community", "anvil_community", "expanse_community", "keeling_community", "rails_community"],
    "geoai-gpu": ["anvil_gpu", "keeling_gpu", "keeling_community"],
    "Extract_Inundation_Census_Tracts_Processor" : ["anvil_community"],
    "ERA5_Connector" : ["anvil_community"],
    "DEM_Raster_Reprojection_Processor" : ["anvil_community"],
    "DEM_Raster_Merging_Processor": ["anvil_community"],
    "DEM_Raster_Clipping_Processor": ["anvil_community"],
    "data_fusion": ["bridges_community_gpu"],
    "Dam_Flood_Inundation_Map_Connector": ["anvil_community"],
    "cybergis-abm": ["anvil_community"],
    "Customized_Resilience_Inference_Measurement_Framework": ["aces_community", "keeling_community"],
    "CUAHSI_Subsetter_Connector":  ["anvil_community"],
    "covid-access": ["keeling_community", "expanse_community", "anvil_community"],
  };

  // Code for job dropdown component
  const handleJobSelect = (job: string) => {
    setSelectedJob(job);

    //Task 2
    if (jobToHpcMap[job]) {
      setHpcs(jobToHpcMap[job]);
    } else {
      setHpcs([]); // or full HPC list if you want by default
    }
  
    setSelectedHpc(null); 

    // Handle job selection (e.g., navigate to job link, display job details, etc.)
    console.log('Selected Job:', job);
  };

  interface JobDropdownProps {
    jobs: string[];
    onJobSelect: (job: string) => void;
  }
  const JobDropdown: React.FC<JobDropdownProps> = ({ jobs, onJobSelect }) => {
    console.log("Rendering job template dropdown: ", jobs);
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedJob = event.target.value;
      if (selectedJob) {
        onJobSelect(selectedJob);
      }
    };
    return (
      <Select
        placeholder={selectedJob ? selectedJob : 'Select a job'}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        {jobs.map(job => (
          <option key={job} value={job}>
            {job}
          </option>
        ))}
      </Select>
    );
  };

  // Code for HPC dropdown component
  const handleHpcSelect = (hpc: string) => {
    setSelectedHpc(hpc);
    // Handle job selection (e.g., navigate to job link, display job details, etc.)
    console.log('Selected HPC:', hpc);
  };
  interface HpcDropdownProps {
    hpcs: string[];
    onHpcSelect: (hpc: string) => void;
  }
  const HpcDropdown: React.FC<HpcDropdownProps> = ({ hpcs, onHpcSelect }) => {
    console.log("Rendering hpc dropdown: ", hpcs);
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedHpc = event.target.value;
      if (selectedHpc) {
        onHpcSelect(selectedHpc);
      }
    };
    return (
      <Select
        placeholder={selectedHpc ? selectedHpc : 'Choose a HPC'}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        {hpcs.map(hpc => (
          <option key={hpc} value={hpc}>
            {hpc}
          </option>
        ))}
      </Select>
    );
  };

  // Code for setting job name
  const handleJobNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJobName(event.target.value);
    console.log(169, 'Job name changed to:', event.target.value);
    // also update the parameters and everything here
  }

  // Code to handle job submission
  const handleJobSubmit = async () => {
    // submitting a job takes three steps
    // 1. POST /job - to create the job object in the backend and get an ID
    // 2. PUT /job/:id - to set the data for the Job object
    // 3. POST /upload - to upload data that will used with the corresponding job (ID passed in formdata)
    // 4. POST /job/:id/submit - to tell the backend the job should be submitted

    // create the Job and get an id
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            'maintainer': "community_contribution",
            "jupyterhubApiToken": token_dict["jupyterhubApiToken"],
            "hpc": selectedHpc ? selectedHpc : "keeling_community"
          }
        )
      })
      .then(resp => resp.json())
      .then(data => {console.log(data); jobID = data["id"];})
      .then(err => {console.log(err); return null});
    console.log("New job ID is:", jobID);

    // upload a zip file input (optional)
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

    // set the job parameters
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID,
      {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "jupyterhubApiToken": token_dict["jupyterhubApiToken"],  // passing oauth
            "localExecutableFolder": {"type": "git", "gitId": selectedJob ? selectedJob : "hello_world"},  // basically just pass the jobID in as the gitId
            "slurm": {"time": "30:00", "memory": "16GB"},
            "param": params,
          }
        )
      })
      .then(resp => resp.json())
      .then(data => {console.log(data); jobID = data["id"];})
      .then(err => {console.log(err)});
    console.log("New job ID is:", jobID);

    // submit the job
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID + '/submit',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(token_dict)
      })
      .then(resp => resp.json())
      .then(data => {console.log(data);})
      .then(err => {console.log(err)});
    

    // const response = await fetch('http://localhost:5000/submit', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   // take in just the selected job/hpc name, do all operations with the complicated json in flask
    //   body: JSON.stringify({ 
    //     name: jobName,
    //     hpc: selectedHpc!,
    //     job: selectedJob!
    //   }),
    // });
    // const responseJson = await response.json();
    // if (responseJson.error) {
    //   console.error('Error submitting job:', responseJson.error);
    //   alert('Unexpected error when submitting job:' + responseJson.error.message);
    //   return;
    // }
    // console.log('Job submitted successfully');
    // return responseJson;
    setSubmissionResponse('✅ job submitted');

    var jobCompleted = false;
    const maxChecks = 10000;
    var numChecks = 0;
    var jobStatusResponse = null;
    while (!jobCompleted && (numChecks < maxChecks)) {
      await sleep(1000);
      setJobFinished("Checking status");
      await sleep(1000);
      setJobFinished("Checking status .");
      await sleep(1000);
      setJobFinished("Checking status . .");
      await sleep(1000);
      setJobFinished("Checking status . . .");
      numChecks += 1;
      await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/job/' + jobID,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(token_dict)
        })
        .then(resp => resp.json())
        .then(data => {console.log(data); jobStatusResponse = data;})
        .then(err => {console.log(err)});
      setJobOutput(JSON.stringify(jobStatusResponse));
      if (jobStatusResponse != null && jobStatusResponse["finishedAt"] != null) {
        jobCompleted = true;
        // grab the logs
        downloadID = jobStatusResponse['remoteResultFolder']['id'];
        setJobFinished("Job is Finished!!!");
      }
    }
    return null;
  };


  // Code to handle job submission
  const handleDownloadResult = async () => {
    // create the Job and get an id
    await fetch('https://cgjobsup-test.cigi.illinois.edu/v2/folder/' + downloadID + '/download/browser',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          {
            "jupyterhubApiToken": token_dict["jupyterhubApiToken"],
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
    console.log("New job ID is:", jobID);
  };

  return (
    <ChakraProvider>
      <Tabs variant="enclosed">
        <Box className="flex justify-between items-center border-b pb-4 mb-4">
          <Heading size="lg">CyberGIS-Compute Web App (ALPHA RELEASE, UNSTABLE)</Heading>
          
            <TabList>
              <Tab>Job Configuration</Tab>
              <Tab>Your Job Status</Tab>
              <Tab>Download Job Result</Tab>
              <Tab>Your Jobs</Tab>
              <Tab>Past Results</Tab>
            </TabList>
        </Box>
        
          <TabPanels>
            <TabPanel> {/*Job Configuration*/}
              {/* ANNOUNCEMENTS */}
              <Box className="mb-4">
                <Heading size="md" className="mb-2">Announcements</Heading>
                <Announcements />
              </Box>

              <Box className="text-left">
                {/* JOB TEMPLATE DROPDOWN */}
                <Box className="flex items-center mb-4">
                  <Text className="mr-2">Job Templates:</Text>
                  <JobDropdown jobs={jobs} onJobSelect={handleJobSelect} />
                </Box>

                {/* JOB/HPC DESCRIPTIONS */}
                <Text className="mb-4">{selectedJob ? selectedJob : "(No job selected)"} Job Description: None</Text>
                <Text className="mb-4">{selectedHpc ? selectedHpc : "(No HPC selected)"} HPC Description: none</Text>
                <Text className="mb-4">Estimated Runtime: unknown</Text>

                <Accordion allowToggle className="text-left">
                  {/* HPC SELECTION ACCORDION */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Computing Resource
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <HpcDropdown hpcs={hpcs} onHpcSelect={handleHpcSelect} />
                      {/* Add content for Computing Resource here */}
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Slurm Computing Configurations
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <Box mb={3}>
                  
                  <Text mb={1}>SLURM Time:</Text>
                  <Input
                    value={slurmParams.time}
                    onChange={(e) => setSlurmParams({ ...slurmParams, time: e.target.value })}
                    placeholder="30:00"
                  />
                </Box>

                <Box mb={3}>
                  <Text mb={1}>SLURM Memory:</Text>
                  <Input
                    value={slurmParams.memory}
                    onChange={(e) => setSlurmParams({ ...slurmParams, memory: e.target.value })}
                    placeholder="16GB"
                  />
                </Box>
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Input Parameters
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
  <Box mb={3}>
    <Text mb={1}>Mobility Mode:</Text>
    <Input
      value={params.mobility_mode}
      onChange={(e) => setParams({...params, mobility_mode: e.target.value})}
      placeholder="DRIVING"
    />
  </Box>
  <Box mb={3}>
    <Text mb={1}>Population Type:</Text>
    <Input
      value={params.population_type}
      onChange={(e) => setParams({...params, population_type: e.target.value})}
      placeholder="ZIP"
    />
  </Box>
  <Box mb={3}>
    <Text mb={1}>Max Travel Time (minutes):</Text>
    <Input
      value={params.max_travel_time}
      onChange={(e) => setParams({...params, max_travel_time: e.target.value})}
      placeholder="30"
    />
  </Box>
  <Box mb={3}>
    <Text mb={1}>Access Measure:</Text>
    <Input
      value={params.access_measure}
      onChange={(e) => setParams({...params, access_measure: e.target.value})}
      placeholder="ALL"
    />
  </Box>

<Box mb={3}>
  <Text mb={1}>Supply Filename:</Text>
  <Input
    value={params.supply_filename}
    onChange={(e) => setParams({...params, supply_filename: e.target.value})}
    placeholder="supply/ContinentalHospitals.shp"
  />
</Box>

<Box mb={3}>
  <Text mb={1}>Supply Capacity:</Text>
  <Input
    value={params.supply_capacity}
    onChange={(e) => setParams({...params, supply_capacity: e.target.value})}
    placeholder="BEDS"
  />
</Box>

<Box mb={3}>
  <Text mb={1}>Supply LatLon or ID:</Text>
  <Input
    value={params.supply_latlon_or_id}
    onChange={(e) => setParams({...params, supply_latlon_or_id: e.target.value})}
    placeholder="ID"
  />
</Box>

<Box mb={3}>
  <Text mb={1}>Supply ID:</Text>
  <Input
    value={params.supply_id}
    onChange={(e) => setParams({...params, supply_id: e.target.value})}
    placeholder="ZIP"
  />
</Box>

<Box mb={3}>
  <Text mb={1}>Supply Latitude:</Text>
  <Input
    value={params.supply_lat}
    onChange={(e) => setParams({...params, supply_lat: e.target.value})}
    placeholder="Supply Latitude"
  />
</Box>

<Box mb={3}>
  <Text mb={1}>Supply Longitude:</Text>
  <Input
    value={params.supply_lon}
    onChange={(e) => setParams({...params, supply_lon: e.target.value})}
    placeholder="Supply Longitude"
  />
</Box>
</AccordionPanel>

                  </AccordionItem>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Data Upload
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <input
                      type="file"
                      id="upload"
                      onChange={handleFileChange}
                      />
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                <Box className="mt-4">
                  <Checkbox>Receive email on job status? (Not implemented yet)</Checkbox>
                  <Input placeholder="example@illinois.edu" className="mt-2"/>
                </Box>
                <Box className="mt-4">
                  <Checkbox>Set a name for this job?</Checkbox>
                  <Input placeholder="Type job name here" className="mt-2" value={jobName} onChange={handleJobNameChange}/>
                </Box>
                <Box>
                  <Button colorScheme="blue" className="mt-4" onClick={handleJobSubmit}>Submit Job</Button>
                </Box>
              </Box>
              {/*<Text className="mb-4">{submissionResponse ? submissionResponse : "Submit a job to view its status"}</Text>
              <Text className="mb-4">{jobFinished ? jobFinished : "Awaiting Job Submission"}</Text>
              <Text className="mb-4">{jobOutput ? jobOutput : "Awaiting Job Submission"}</Text>*/}
              {/*<Box>
                  <Button colorScheme="blue" className="mt-4" onClick={handleDownloadResult}>Download Result</Button>
                </Box>
                */}
            </TabPanel> {/*end of job configuration*/}

            <TabPanel>
              {/* Add content for "Your Job Status" tab here */}
              <Heading size="md" mb={4}>Your Job Status</Heading>

              <Text className="mb-4">
                {submissionResponse ? submissionResponse : "Submit a job to view its status"}
              </Text>

              <Text className="mb-4">
                {jobFinished ? jobFinished : "Awaiting Job Submission"}
              </Text>

              <Text className="mb-4">
                {jobOutput ? jobOutput : "Awaiting Job Submission"}
              </Text>
            </TabPanel>

            <TabPanel>
          
            <Heading size="md" mb={4}>Download Your Results</Heading>
            {downloadID ? (
              <>
                <Text>Job completed. Your results are ready to download!</Text>
                <Button colorScheme="blue" className="mt-4" onClick={handleDownloadResult}>
                  Download Result
                </Button>
              </>
            ) : (
              <Text>No completed job found. Submit a job first!</Text>
            )}
          </TabPanel>

          <TabPanel>
              {/* Add content for "Your Jobs" tab here */}
          </TabPanel>

          <TabPanel>
              {/* Add content for "Past Results" tab here */}
          </TabPanel>

          </TabPanels>
        </Tabs>
    </ChakraProvider>
  );
};

export default App