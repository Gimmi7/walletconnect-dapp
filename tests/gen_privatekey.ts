import { ethers } from "ethers";

const phrase = "begin spice review acquire gasp bulb invite system quit omit bring guess"
const menemonicWallet = ethers.Wallet.fromMnemonic(phrase)
const privateKey = menemonicWallet.privateKey
const address = await menemonicWallet.getAddress()
console.log("privateKey=", privateKey) // 0x4e0c4db95dfc5aa6dc6aafd4a71f3c6ca84c8063fc92d38b54ce1d1b2e85ad3d
console.log("address=", address) // 0x599e1C9e7C15Bd3A0F58318b5DB729648fc45c01


const tx = {
  from: "0x599e1C9e7C15Bd3A0F58318b5DB729648fc45c01", // Required
  to: "0x599e1C9e7C15Bd3A0F58318b5DB729648fc45c01", // Required
  value: '0x0', // Required
  data: '0xdb60', // Required
}

const signedTx = await menemonicWallet.signTransaction(tx)
console.log("signedTx=", signedTx)
const decodetx = ethers.utils.parseTransaction(signedTx)
// const decodetx = ethers.utils.RLP.decode(signedTx)
console.log(decodetx)

