import React from 'react'
import DynamicForm from './DynamicAddTopics'
import DashboardPage from './DashboardPage'
import SubmissionTracker from './submissiontrack'
import AdminSubmissionManager from './AdminSubmissionManager'

const Dashboard = () => {
  return (
   <>
   <AdminSubmissionManager/>
<DashboardPage/>
   </>
  )
}

export default Dashboard