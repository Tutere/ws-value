import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export default function ProjectForm() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  return (
    <div className=' mx-10'>
      <div className='flex justify-start my-12 w-28  '>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)} //not sure about this error
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Pick Date"
          dateFormat="d MMMM, yyyy"
          className='w-28  border-b-slate-400 border-b-2'
        />
        <h1 className='ml-8'>TO</h1>

        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}  //not sure about this error
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Pick Date"
          dateFormat="d MMMM, yyyy"
          className='ml-8 w-28 border-b-slate-400 border-b-2'
        />
      </div>
      <h1 className='my-10'>
        Completed Activities
      </h1>
    </div>
  );
}
