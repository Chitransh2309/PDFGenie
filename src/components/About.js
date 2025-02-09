import React, { Component } from 'react'

export class About extends Component {
  render() {
    return (
      <div style={{marginBottom: 15}}>
        <h1 className="text-light text-center my-2">About Us</h1>
        <div className="container">
          <div className="box">
            <div>
              <p className='my-1 mx-3'>The AIQ+ is an intelligent system designed to automatically clean, validate, and enrich datasets by leveraging advanced machine learning algorithms. It detects and corrects inconsistencies, removes duplicates, fills in missing values, and identifies anomalies in real time, ensuring high-quality, reliable data for analytics and decision-making. The system continuously learns from patterns to improve data integrity, enabling businesses to maintain accurate records and optimize processes. With seamless integration into existing data pipelines, it enhances operational efficiency while reducing manual effort, making it an essential tool <br/>for organizations handling large volumes of data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default About
