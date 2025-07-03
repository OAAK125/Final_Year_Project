'use client'
import * as React from 'react';
import { HomeTop } from '@/ui/quiz-dashboard/home-top';
import { HomeMiddle } from '@/ui/quiz-dashboard/home-middle';
import { HomeBottom } from '@/ui/quiz-dashboard/home-bottom';

export default function DashboardHome() {
  return(
    <>
    <HomeTop />
    <HomeMiddle />
    <HomeBottom />
    </>

  )
}