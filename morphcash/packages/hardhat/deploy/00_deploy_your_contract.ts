import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys all MorphCash contracts using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMorphCashContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy GreetingContract
  await deploy("GreetingContract", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy ENSProfileContract
  await deploy("ENSProfileContract", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy VirtualCardContract
  await deploy("VirtualCardContract", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Deploy PaymentContract
  await deploy("PaymentContract", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Get the deployed contracts to interact with them after deploying.
  const greetingContract = await hre.ethers.getContract<Contract>("GreetingContract", deployer);
  const ensProfileContract = await hre.ethers.getContract<Contract>("ENSProfileContract", deployer);
  const virtualCardContract = await hre.ethers.getContract<Contract>("VirtualCardContract", deployer);
  const paymentContract = await hre.ethers.getContract<Contract>("PaymentContract", deployer);

  console.log("👋 Initial greeting:", await greetingContract.greeting());
  console.log("📝 ENS Profile Contract deployed at:", await ensProfileContract.getAddress());
  console.log("💳 Virtual Card Contract deployed at:", await virtualCardContract.getAddress());
  console.log("💰 Payment Contract deployed at:", await paymentContract.getAddress());
};

export default deployMorphCashContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MorphCash
deployMorphCashContracts.tags = ["MorphCash", "All"];
