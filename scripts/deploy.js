const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const Assessment = await ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy();

  await assessment.deployed();

  console.log("Contract deployed to:", assessment.address);

  // Save the contract address and ABI to use in the frontend
  const data = {
    address: assessment.address,
    abi: JSON.stringify(Assessment.interface),
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
