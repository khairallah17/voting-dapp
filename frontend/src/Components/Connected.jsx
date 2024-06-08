import React from "react";
import CandidateList from "./CandidateList";
import { OctagonAlert } from 'lucide-react';

const Connected = (props) => {

  function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " hour(s) and " + rminutes + " minute(s).";
    }

    return (
      <div class="candidate-list-form">
        <div className="connected-container">
          <h1 className="connected-header text-red-400">Hello To Votelo</h1>
          <p className="connected-account"><b>Metamask Account:</b> {props.account}</p>
          <p className="connected-account">
            <b>Remaining Time:</b> {timeConvert(props.remainingTime)}
          </p>
          {props.showButton ? (
            <div className="error">
              <OctagonAlert  color="red"/>
              <p>You have already voted</p>
            </div>
          ) : (
            <div className="voting-form">
              <input
                type="number"
                placeholder="Entern Candidate Index"
                value={props.number}
                onChange={props.handleNumberChange}
              ></input>
              <br />
              <button className="add-button" onClick={props.voteFunction}>
                Vote
              </button>
            </div>
          )}
        </div>
        {
          props.candidates.length > 0 ?
          <CandidateList
          candidates={props.candidates}
          setIndex={props.setIndex}
        /> : <div className="error">
        <OctagonAlert  color="red"/>
        <p>No candidates</p>
      </div>
        }
      </div>
    );
}

export default Connected;