'use client'
import * as React from 'react';
import { HomeTop } from './home-top';
import { HomeMiddle } from './home-middle';
import { HomeBottom } from './home-bottom';

export default function DashboardHome() {
  return(
    <>
    <HomeTop />
    <HomeMiddle />
    <HomeBottom />
    </>

  )
}