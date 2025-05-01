import { useState, useEffect, ChangeEvent } from 'react'
import './App.css'
import { TabList, TabPanel, Tab, Tabs, TabPanels, ChakraProvider, Box, Heading, Text, Select, Input, Checkbox, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from '@chakra-ui/react';
import { AnnouncementType, ListData } from './types';


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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  // Code to load data from flask backend at start
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, []);

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

  // Code for job dropdown component
  const handleJobSelect = (job: string) => {
    setSelectedJob(job);
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
    // 3. POST /job/:id/submit - to tell the backend the job should be submitted

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

    if (file !== null) {
      const formData = new FormData()
      formData.append("jupyterhubApiToken", token_dict["jupyterhubApiToken"]);
      formData.append("jobId", jobID);
      formData.append("file", file);
      // upload
      await fetch('https://cgjobup-test.cigi.illinois.edu/v2/upload', {
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
      <Box className="p-4">
        <Box className="flex justify-between items-center border-b pb-4 mb-4">
          <Heading size="lg">CyberGIS-Compute Web App (ALPHA RELEASE, UNSTABLE)</Heading>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Job Configuration</Tab>
              <Tab>Your Job Status</Tab>
              <Tab>Download Job Result</Tab>
              <Tab>Your Jobs</Tab>
              <Tab>Past Results</Tab>
            </TabList>
          </Tabs>
        </Box>
        <Tabs variant="enclosed">
          <TabPanels>
            <TabPanel>
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
                        Slurm Computing Configurations (Not implemented yet)
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {/* Add content for Slurm Computing Configurations here */}
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        Input Parameters (Not implemented yet)
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {/* Add content for Input Parameters here */}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                <input
                  type="file"
                  id="upload"
                  onChange={handleFileChange}
                />
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
              <Text className="mb-4">{submissionResponse ? submissionResponse : "Submit a job to view its status"}</Text>
              <Text className="mb-4">{jobFinished ? jobFinished : "Awaiting Job Submission"}</Text>
              <Text className="mb-4">{jobOutput ? jobOutput : "Awaiting Job Submission"}</Text>
              <Box>
                  <Button colorScheme="blue" className="mt-4" onClick={handleDownloadResult}>Download Result</Button>
                </Box>
            </TabPanel>
            <TabPanel>
              {/* Add content for "Your Job Status" tab here */}
            </TabPanel>
            <TabPanel>
              {/* Add content for "Download Job Result" tab here */}
            </TabPanel>
            <TabPanel>
              {/* Add content for "Your Jobs" tab here */}
            </TabPanel>
            <TabPanel>
              {/* Add content for "Past Results" tab here */}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </ChakraProvider>
  );
};

export default App
