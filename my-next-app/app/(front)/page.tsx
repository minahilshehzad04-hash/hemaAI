import React from 'react'
import Hero from '@/components/General/Hero'
import Home from '@/components/General/Home'

function page() {
  return (
    <>
      <section className='text-3xl flex min-h-screen justify-center'>
        <Hero />
      </section>
      <div className='m-auto min-h-screen'>
        <Home />
      </div>
    </>
  )
}

export default page
