import React from 'react';
import Button from './templatebtn';
import Button1 from './getstartedbtn';

const Herosection = () => {
  return (
    <div id="heroSec">
      <Button/>
      <p className='my-5' id='herotext' style={{marginLeft:200}}>Seamlessly Merge Your PDFs — Fast, Free, and Secure!</p>
      <Button1/>
    </div>
  );
}

export default Herosection;

