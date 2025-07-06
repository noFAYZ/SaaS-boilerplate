'use client'

import GooeyLoader from '@/components/shared/loader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react'



export default function Layout({
    children,
  }: {
    children: React.ReactNode;
  }) {

    const {  user } = useAuth();    
    if (!user) {
        return (
          <div className="flex h-[90vh] items-center justify-center">
            
          <div className="flex items-center space-x-2">
      <GooeyLoader />
           <div className="flex flex-col">
             <span className="text-xl font-bold">MoneyMappr</span>
           
    </div>
    
          </div>
        </div>
        );
      }


    return (
     <div className='max-w-3xl mx-auto '> 
     {children}
     </div>
         
      
  
    );
  }