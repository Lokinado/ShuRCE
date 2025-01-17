import { useEffect, useState } from 'react'
import { fetchClient } from '../openapi-client';
import { notifications } from '@mantine/notifications';
import { update } from '../state/jobs/JobsSlice';
import { RootState } from '../state/store';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button, Group, Table } from '@mantine/core';

const Jobs = ()=>{
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

  const renderBadge = (value: boolean) => {
    return value ? <Badge color="blue">True</Badge> : <Badge color="red">False</Badge>
  }

  if(isLoading) {
    return(<>Loading...</>) // TODO: Add loading gif component
    } else {
      if(!jobs) jobs = []

      const rows = jobs.map((job, index) => (
        <Table.Tr key={job.id}>
          <Table.Td>{index}</Table.Td>
          <Table.Td>{job.template.name}</Table.Td>
          <Table.Td>{job.status}</Table.Td>
          <Table.Td>{renderBadge(job.is_build)}</Table.Td>
          <Table.Td>{job.error_message}</Table.Td>
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
                <Table.Th>Status</Table.Th>
                <Table.Th>Is built</Table.Th>
                <Table.Th>Error message</Table.Th>
                <Table.Th>Date finished</Table.Th>
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

export default Jobs;