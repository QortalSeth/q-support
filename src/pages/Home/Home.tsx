import React from 'react'
import { FileList } from './FileList.tsx'

import { useSelector } from 'react-redux'
import { RootState } from '../../state/store'

export const Home = () => {

  return (
    <>
    <FileList />
    </>
   
  )
}
