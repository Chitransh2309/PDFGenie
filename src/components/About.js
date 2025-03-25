import React, { Component } from 'react'

export class About extends Component {
  render() {
    return (
      <div style={{marginBottom: 15}}>
        <h1 className="text-light text-center my-2">About Us</h1>
        <div className="container">
          <div className="box">
            <div>
              <p className='my-1 mx-3'>At AIQ+, we believe that managing PDFs should be quick, easy, and hassle-free. Our platform is designed to help you merge multiple PDF files into a single, organized document in just a few clicks. Whether you're a student compiling research papers, a professional handling reports, or simply organizing personal documents, AIQ+ offers a smooth and efficient solution to simplify your workflow. What sets AIQ+ apart is our commitment to providing a secure and user-friendly experience. There's no need to worry about complex processes or hidden fees — we keep things simple. With no sign-ups required, you can instantly merge your PDFs and get back to what matters most.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default About
