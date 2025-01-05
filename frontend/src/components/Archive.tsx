import { useEffect, useState } from 'react'
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { update } from '../state/jobs/JobsSlice';
import { RootState } from '../state/store';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Group, Table } from '@mantine/core';

const Archive = ()=>{
  const [isLoading, setLoading] = useState(true);
  let jobs = useSelector((state: RootState) => state.jobsReducer.jobs);
  const dispatch = useDispatch();
  
  useEffect(()=>{
    fetchClient.GET("/v1/jobs/my", {}).then((value) =>{
      if(value.error){
        setLoading(false)
        notifications.show({
          title: 'Can not load jobs',
          message: 'User has insufficient permissions to load all jobs',
        })
      }
      if(value.data){
        console.log(value.data)
        setLoading(false)
        dispatch(update(value.data))
      }
    });
  }, [dispatch])

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
  } else {

    if(!jobs) jobs = []

    jobs = jobs.filter((job) => job.status === "Finished")

    console.log(jobs)

    const rows = jobs.map((job, index) => (
      <Table.Tr key={job.id}>
        <Table.Td>{index}</Table.Td>
        <Table.Td>{job.template.name}</Table.Td>
        <Table.Td>
          <Button
            component="a"
            href={`/v1/jobs/logs?job_id=${job.id}`}
            variant="filled"
          >
            Download Logs
          </Button>
        </Table.Td>
        <Table.Td>
        <Button
            component="a"
            href={`/v1/jobs/archive?job_id=${job.id}`}
            variant="filled"
          >
            Download Archive
          </Button>
        </Table.Td>
        <Table.Td>{new Date(job.date_created).toLocaleString()}</Table.Td>
        <Table.Td>{new Date(job.date_created).toLocaleString()}</Table.Td>
        <Table.Td>
          <Button variant="filled" color="red">Delete</Button>
        </Table.Td>
      </Table.Tr>
    ));

    return(
      <div>
        {jobs.length === 0 ? <Group justify='center'>There are no jobs.</Group> : 
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Index</Table.Th>
              <Table.Th>Template</Table.Th>
              <Table.Th>Logs</Table.Th>
              <Table.Th>Archive</Table.Th>
              <Table.Th>Date Finished</Table.Th>
              <Table.Th>Date created</Table.Th>
              <Table.Th>Operation</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>}
      </div>
    )
  }
}

export default Archive;