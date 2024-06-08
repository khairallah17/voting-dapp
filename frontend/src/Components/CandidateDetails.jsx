import React from 'react'

const CandidateDetails = ({
    name,
    image,
    speech,
    votes
}) => {
  return (
    <div className='app-container'>
        <div className='candidate-container-details'>
            <h1 className="title">{name}</h1>
            <img src={image} className="image-container" alt="" />
            <h2>Speech: </h2>
            <p>{speech}</p>
            <p><b>Number of Votes:</b> {votes}</p>
        </div>
    </div>
  )
}

export default CandidateDetails