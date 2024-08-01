// sharedLogic.js

export const ERC20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "function approve(address spender, uint256 value) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
];

// Helper function to parse Ether errors
export const parseEtherException = (e) => {
  const regex = /Error: (.*) \(action./;
  const match = e.toString().match(regex);
  return match ? match[1] : e.message;
};
