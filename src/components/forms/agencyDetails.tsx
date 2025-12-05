import React from 'react'
import { Agency } from '@prisma/client'
type AgencyDetailsProps = {
  data?: Partial<Agency>
}

const agencyDetails = ({data}: AgencyDetailsProps) => {
  return (
    <div>agencyDetails</div>
  )
}

export default agencyDetails