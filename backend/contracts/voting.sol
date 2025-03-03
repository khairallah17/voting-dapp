// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;


contract Voting {

    struct Candidate {
        string name;
        uint256 voteCount;
        string image;
        string votingSpeech;
    }

    address owner;
    Candidate[] public candidates;
    mapping(address => bool) public voters;

    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(string[] memory _candidateNames, string[] memory _candidateImages, uint256 _durationInMinutes, string[] memory _votingSpeech) {
        require(_candidateNames.length == _candidateImages.length, "Names and images arrays must have the same length");
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                image: _candidateImages[i],
                votingSpeech: _votingSpeech[i],
                voteCount: 0
            }));
        }
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function addCandidate(string memory _name, string memory _image, string memory _speech) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            image: _image,
            votingSpeech: _speech,
            voteCount: 0
        }));
    }

    function vote(uint256 _candidateIndex) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}
