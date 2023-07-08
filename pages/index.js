import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      let currBalance = await atm.getBalance();
      currBalance = ethers.utils.formatEther(currBalance);
      setBalance(currBalance);
    }
  }

  const getAmount = () => {
    let amount = document.getElementById("amount").value;
    // Check if amount is a positive number and not a string
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount"); 
      return -1;
    }
    return amount;
  }

  const deposit = async() => {
    if (atm) {
      let amount = getAmount();
      // Check if amount is valid
      if (amount == -1) {
        return;
      }
      try{
        const parsedAmount = ethers.utils.parseEther(amount.toString());
        let tx = await atm.deposit({ value: ethers.utils.parseEther(amount.toString()) });
        await tx.wait()
        getBalance();

      }
      catch (err) {
        alert("Only owner can deposit funds");
        console.log(err);
      }
    }
  }

  const enoughFunds = (amount) => {
    if (amount > balance) {
      alert("You do not have enough funds to withdraw " + amount + " ETH.");
      return false;
    }
    return true;
  }

  const withdraw = async() => {
    if (atm) {
      let amount = getAmount();
      if (amount == -1) {
        return;
      }
      // Check if user has enough funds to withdraw
      if (!enoughFunds(amount)) {
        return;
      }
      let tx = await atm.withdraw(ethers.utils.parseEther(amount.toString()));
      await tx.wait()
      getBalance();
    }
  }

  const transferEther = async () => {
    if (!atm) {
      return
    }

    let amount = getAmount();
    amount = ethers.utils.parseEther(amount.toString());
    let toAddress = document.getElementById("toAddress").value;
    if (amount == -1 || !validateAddress(toAddress) || !enoughFunds(amount)) {
      return;
    }
    // Transfer balance to another account
    
    let tx = await atm.transfer(toAddress, amount);
    await tx.wait();
    getBalance();

  }

  const validateAddress = (address) => {
    // Check if address is valid and starts with 0x
    if (address.substring(0,2) != "0x" && address.length != 42) {
      alert("Please enter a valid address");
      return false;
    }
    return true;
  }

  // Function bets 1 ETH in which if the user wins, they get an additional ether, but if they lose
  // they lose their ether
  const betEther = async() => {
    if (atm) {
      // Get user's guess
      let guess = document.getElementById("guess").value;

      // Check to see if guess is valid
      if (guess != 0 && guess != 1) {
        alert("Please enter a valid guess (0 or 1)");
        return;
      }

      // Random number between 0 and 1
      let results = document.getElementById("results");
      let randomNumber = Math.floor(Math.random() * 2);
      if (randomNumber == guess) {
        let tx = await atm.deposit(1);
        await tx.wait()
        getBalance();
        results.innerHTML = "You won! You now have " + (balance+1) + " ETH.";
      }
      else {
        let tx = await atm.withdraw(1);
        await tx.wait()
        getBalance();
        results.innerHTML = "You lost! You now have " + (balance-1) + " ETH.";
      }
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Amount</p>
        <input type="text" id="amount" name="amount"></input>
        <br></br>
        <button onClick={deposit}>Mint ETH</button>
        <button onClick={withdraw}>Burn ETH</button>
        <p>Transfer Amount of ETH to address</p>
        <input type="text" id="toAddress" name="toAddress"></input>
        <button onClick={transferEther}>Transfer ETH</button>
        <p>Enter your guess (0 or 1):</p>
        <input type="text" id="guess" name="guess"></input>
        <button onClick={betEther}>Bet 1 ETH</button>
        <p id="results"></p>

      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}