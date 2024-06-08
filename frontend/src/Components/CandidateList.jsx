import React from 'react'

const CandidateList = (props) => {
  return (
    <div className="list-container">            
        <table id="myTable" className="candidates-table">
        <thead>
            <tr>
                <th>Index</th>
                <th>name</th>
                <th>votes</th>
            </tr>
            </thead>
            <tbody>
            {props.candidates.map((candidate, index) => (
                <tr onClick={() => props.setIndex(candidate.index)} key={index}>
                    <td>{candidate.index}</td>
                    <td>{candidate.name}</td>
                    <td>{candidate.voteCount}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
  )
}

export default CandidateList