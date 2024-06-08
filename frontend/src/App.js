import React, {useState, useEffect} from "react";
import axios from "axios";
import {ethers} from "ethers";
import {contractAbi, contractAddress} from "./Constant/constant";
import Login from "./Components/Login";
import Finished from "./Components/Finished";
import Connected from "./Components/Connected";
import "./App.css";
import CandidateList from "./Components/CandidateList";
import CandidateDetails from "./Components/CandidateDetails";
import toast, { Toaster } from 'react-hot-toast';

const pinataApiKey = "08c39fb07605da7f4c06";
const pinataSecretApiKey =
  "633f9d927bab3bb6c6ce0ebdcd30461a551511b61908236c7ddac7da5ed711c2";

function App() {

  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState("");
  const [isAllowedToVote, setIsAllowedToVote] = useState(true);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateImage, setNewCandidateImage] = useState(null);
  const [newCandidateSpeech, setNewCandidateSpeech] = useState("")

  const [index, setIndex] = useState(0)

  useEffect(() => {
    getCandidates();
    getRemainingTime();
    getCurrentStatus();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  async function vote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    const tx = await contractInstance.vote(number);
    await tx.wait();
    checkIfCanVote();
    getCandidates()
    toast.success("vote succeeded")
  }

  async function addCandidate() {
    if (!newCandidateName || !newCandidateImage) {
      return alert("Please enter candidate name and select an image");
    }

    try {
      const formData = new FormData();
      formData.append("file", newCandidateImage);

      const metadata = JSON.stringify({
        name: newCandidateImage.name,
        keyvalues: {
          description: "Candidate image uploaded using Pinata",
        },
      });

      formData.append("pinataMetadata", metadata);
      formData.append("pinataOptions", JSON.stringify({cidVersion: 1}));

      const result = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      const imageUrl = `https://gateway.pinata.cloud/ipfs/${result.data.IpfsHash}`;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const tx = await contractInstance.addCandidate(
        newCandidateName,
        imageUrl,
        newCandidateSpeech
      );
      await tx.wait();
      getCandidates();
      setNewCandidateImage(null)
      setNewCandidateName("")
      setNewCandidateSpeech("")
      toast.success("candidate added")
    } catch (error) {
      toast.error("you do not have the permission")
      console.error("Error uploading image to Pinata:", error);
      alert("Failed to upload image to Pinata");
    }
  }

  async function checkIfCanVote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const voteStatus = await contractInstance.voters(await signer.getAddress());
    setIsAllowedToVote(voteStatus);
  }

  async function getCandidates() {
    
    try {

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const candidatesList = await contractInstance.getAllVotesOfCandidates();
      console.log("candidates ==> ",candidatesList)
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber(),
          image: candidate.image,
          speech: candidate.votingSpeech
        };
      });
      console.log(formattedCandidates)
      setCandidates(formattedCandidates);

    } catch(error) {
      console.log(error.message)
    }

  }

  async function getCurrentStatus() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const status = await contractInstance.getVotingStatus();
    setVotingStatus(status);
  }

  async function getRemainingTime() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const time = await contractInstance.getRemainingTime();
    setRemainingTime(parseInt(time, 16));
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      checkIfCanVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        checkIfCanVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  function handleNumberChange(e) {
    setNumber(e.target.value);
  }

  function handleNewCandidateChange(e) {
    setNewCandidateName(e.target.value);
  }

  function handleNewCandidateImageChange(e) {
    setNewCandidateImage(e.target.files[0]);
  }

  function handleNewCandidateSpeech(e) {
    setNewCandidateSpeech(e.target.value)
  }

  return (
    <div className="app">
      {votingStatus ? (
        isConnected ? (
          <div className="app-container-holder">
            <div className="app-container">
              <Connected
                account={account}
                candidates={candidates}
                remainingTime={remainingTime}
                number={number}
                handleNumberChange={handleNumberChange}
                voteFunction={vote}
                showButton={isAllowedToVote}
                setIndex={setIndex}
              />
              <AddCandidate
                addCandidate={addCandidate}
                newCandidateName={newCandidateName}
                handleNewCandidateChange={handleNewCandidateChange}
                handleNewCandidateImageChange={handleNewCandidateImageChange}
                newCandidateSpeech={newCandidateSpeech}
                handleNewCandidateSpeech={handleNewCandidateSpeech}
              />
            </div>
            {
              candidates.length > 0 && 
                <CandidateDetails
                  name={candidates[index].name}
                  image={candidates[index].image}
                  speech={candidates[index].speech}
                  votes={candidates[index].voteCount}
                />
            }
          </div>
          
        ) : (
          <Login connectWallet={connectToMetamask} />
        )
      ) : (
        <Finished />
      )}
      <Toaster />
    </div>
  );
}

function AddCandidate({
  addCandidate,
  newCandidateName,
  handleNewCandidateChange,
  handleNewCandidateImageChange,
  newCandidateSpeech,
  handleNewCandidateSpeech
}) {
  return (
    <div className="connected-form">
      <input
        type="text"
        value={newCandidateName}
        onChange={handleNewCandidateChange}
        placeholder="Candidate Name"
      />
      <input type="file" onChange={handleNewCandidateImageChange} />
      <textarea
        type="text"
        value={newCandidateSpeech}
        onChange={handleNewCandidateSpeech}
        placeholder="candidate speech"
      />
      <button className="add-button" onClick={addCandidate}>Add Candidate</button>
    </div>
  );
}

export default App;
