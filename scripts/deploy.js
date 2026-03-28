const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const InvoiceFunding = await ethers.getContractFactory("InvoiceFunding");
  const contract = await InvoiceFunding.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ InvoiceFunding deployed to:", address);
  console.log("\n👉 Add this to your .env:");
  console.log(`REACT_APP_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
