# Starter Next/Hardhat Project

After cloning the github, you will want to do the following to get the code running on your computer.

1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/


## Functionalities
- getBalance()
  - This function gets the balance of the user from the wallet and updates it in the UI
- withdraw()
  - This function removes ether from the user's wallet
- enoughFunds()
  - This function checks if the user has enough ether to withdraw from the wallet
- deposit()
  - This function adds ether to the user's wallet
- betEther()
  - This function either adds or removes ether from the user's wallet depending if they were able to guess the randomized number
