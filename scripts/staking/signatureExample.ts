import { ethers } from "ethers";
import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";

// ABI fragment for the router
const ROUTER_ABI = [
  "function nonces(address account) view returns (uint256)",
  "function getDomainSeparator() view returns (bytes32)",
  "function stakeAmpedForAccount(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) returns (uint256)",
  "function unstakeAmpedForAccount(address account, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) returns (uint256)",
];

interface StakeRequest {
  account: string;
  amount: ethers.BigNumber;
  nonce: ethers.BigNumber;
  deadline: number;
}

interface UnstakeRequest {
  account: string;
  amount: ethers.BigNumber;
  nonce: ethers.BigNumber;
  deadline: number;
}

export class AmpedStakingSignatureHelper {
  private provider: ethers.providers.Provider;
  private routerAddress: string;
  private routerContract: ethers.Contract;
  private domain: TypedDataDomain;

  constructor(
    provider: ethers.providers.Provider,
    routerAddress: string,
    chainId: number
  ) {
    this.provider = provider;
    this.routerAddress = routerAddress;
    this.routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider);
    
    this.domain = {
      name: "AmpedStakingRouter",
      version: "2",
      chainId: chainId,
      verifyingContract: routerAddress,
    };
  }

  // Generate signature for staking
  async generateStakeSignature(
    signer: ethers.Signer,
    amount: ethers.BigNumber,
    deadlineMinutes: number = 30
  ): Promise<{ v: number; r: string; s: string; deadline: number }> {
    const account = await signer.getAddress();
    const nonce = await this.routerContract.nonces(account);
    const deadline = Math.floor(Date.now() / 1000) + deadlineMinutes * 60;

    const types = {
      Stake: [
        { name: "account", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value: StakeRequest = {
      account,
      amount,
      nonce,
      deadline,
    };

    const signature = await signer._signTypedData(this.domain, types, value);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    return { v, r, s, deadline };
  }

  // Generate signature for unstaking
  async generateUnstakeSignature(
    signer: ethers.Signer,
    amount: ethers.BigNumber,
    deadlineMinutes: number = 30
  ): Promise<{ v: number; r: string; s: string; deadline: number }> {
    const account = await signer.getAddress();
    const nonce = await this.routerContract.nonces(account);
    const deadline = Math.floor(Date.now() / 1000) + deadlineMinutes * 60;

    const types = {
      Unstake: [
        { name: "account", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const value: UnstakeRequest = {
      account,
      amount,
      nonce,
      deadline,
    };

    const signature = await signer._signTypedData(this.domain, types, value);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    return { v, r, s, deadline };
  }

  // Execute stake with signature
  async stakeWithSignature(
    signer: ethers.Signer,
    amount: ethers.BigNumber,
    deadlineMinutes: number = 30
  ): Promise<ethers.ContractTransaction> {
    const { v, r, s, deadline } = await this.generateStakeSignature(
      signer,
      amount,
      deadlineMinutes
    );

    const routerWithSigner = this.routerContract.connect(signer);
    const account = await signer.getAddress();

    return routerWithSigner.stakeAmpedForAccount(
      account,
      amount,
      deadline,
      v,
      r,
      s
    );
  }

  // Execute unstake with signature
  async unstakeWithSignature(
    signer: ethers.Signer,
    amount: ethers.BigNumber,
    deadlineMinutes: number = 30
  ): Promise<ethers.ContractTransaction> {
    const { v, r, s, deadline } = await this.generateUnstakeSignature(
      signer,
      amount,
      deadlineMinutes
    );

    const routerWithSigner = this.routerContract.connect(signer);
    const account = await signer.getAddress();

    return routerWithSigner.unstakeAmpedForAccount(
      account,
      amount,
      deadline,
      v,
      r,
      s
    );
  }

  // Verify a signature is valid (useful for debugging)
  async verifyStakeSignature(
    account: string,
    amount: ethers.BigNumber,
    deadline: number,
    v: number,
    r: string,
    s: string
  ): Promise<boolean> {
    try {
      const nonce = await this.routerContract.nonces(account);
      
      const types = {
        Stake: [
          { name: "account", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        account,
        amount,
        nonce,
        deadline,
      };

      // Recreate the digest
      const digest = ethers.utils._TypedDataEncoder.hash(this.domain, types, value);
      
      // Recover the signer
      const recoveredAddress = ethers.utils.recoverAddress(digest, { v, r, s });
      
      return recoveredAddress.toLowerCase() === account.toLowerCase();
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }
}

// Example usage
async function exampleUsage() {
  // Connect to provider
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
  
  // Initialize helper
  const routerAddress = "0x..."; // Your router address
  const chainId = 1; // Mainnet
  const helper = new AmpedStakingSignatureHelper(provider, routerAddress, chainId);
  
  // Stake 100 AMPED tokens
  const amount = ethers.utils.parseEther("100");
  
  try {
    // Generate signature
    const { v, r, s, deadline } = await helper.generateStakeSignature(signer, amount);
    
    console.log("Signature generated:");
    console.log("v:", v);
    console.log("r:", r);
    console.log("s:", s);
    console.log("deadline:", deadline);
    
    // Execute transaction
    const tx = await helper.stakeWithSignature(signer, amount);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Export for use in other modules
export default AmpedStakingSignatureHelper;