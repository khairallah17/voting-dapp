async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Owner address: " + deployer.address);
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy([],[], 90, []);
    await voting.deployed();
    console.log("Voting deployed to:", voting.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});