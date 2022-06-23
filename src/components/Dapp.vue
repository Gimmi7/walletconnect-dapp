<script setup lang="ts">
import { reactive, inject, onMounted } from "vue"
import WalletConnect from '@walletconnect/client/dist/umd/index.min.js'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { Message } from 'element-plus/es/components/message'

localStorage.clear()
onMounted(() => {
})
const $message: Message = inject('$message')!
const data = reactive({
  connected: false,
  uri: '',
  accounts: [],
  chainId: ''
})

const connector = new WalletConnect(
  {
    bridge: 'https://bridge.walletconnect.org',
    clientMeta: {
      description: "wc-dapp test for beta-wallet",
      url: "https://www.streamingfast.io/",
      icons: ["https://uploads-ssl.webflow.com/621906be0e525161b33f0e41/621939cb15ef9c3768a7e8bb_background-a-2.svg"],
      name: "wc-dapp",
    }
  },
)

connector.on('connect', (err, payload) => {
  if (err) {
    console.log('connect err=', err)
    $message.error('connect err')
    return
  }
  const { accounts, chainId } = payload.params[0]
  data.accounts = accounts
  data.chainId = chainId
  data.connected = true
  QRCodeModal.close()
  $message.success('connect success')
  console.log(data)
})

connector.on('session_update', (err, payload) => {
  if (err) {
    console.log('session_update err=', err)
    $message.error('session_update err')
    return
  }
  const { accounts, chainId } = payload.params[0]
  data.accounts = accounts
  data.chainId = chainId
  data.connected = true
  $message.success('session_update success')
  console.log(payload.params)
})


connector.on('disconnect', (err, payload) => {
  if (err) {
    console.log('disconnect err=', err, payload)
    $message.error('disconnect err')
    return
  } else {
    $message.error(payload?.params?.[0]?.message)
  }
  data.connected = false
})

function getUri() {
  if (!connector.connected) {
    connector.createSession().then(() => {
      data.uri = connector.uri
      QRCodeModal.open(data.uri, null)
    })
  }
}

function disconnect() {
  connector.killSession()
}

function sendTransaction() {
  const tx = {
    from: data.accounts[0], // Required
    to: data.accounts[0], // Required
    value: '0x0', // Required
    data: '0xddd', // Required
  }
  connector
    .sendTransaction(tx)
    .then((res) => {
      console.log('sendTransaction res=', res)
    })
    .catch((err) => {
      $message.error(err.message)
      console.log("sendTransaction err=", err)
    })
}

async function signTypedData() {
  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Message: [
        { name: 'params', type: 'string' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Message',
    domain: {
      name: 'wangcy 712',
      version: '1',
      chainId: '1',
      verifyingContract: '0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47',
    },
    message: {
      params: 'test1',
      deadline: 110,
    },
  }
  const params = [data.accounts[0], JSON.stringify(typedData)]
  const req = {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_signTypedData_v4',
    params,
  }
  connector.sendCustomRequest(req).then(data => {
    console.log("signTypedData_v4 signature=", data)
    $message.success("signTypedData_v4 success")
  }).catch(err => {
    console.log("walletconnect signTypedData_v4 err=", err)
    $message.error(err.message)
  })
}


function personal_sign() {
  const req = {
    id: 1,
    jsonrpc: '2.0',
    method: 'personal_sign',
    params: ['0xwangcy', data.accounts[0]]
  }
  connector.sendCustomRequest(req).then(data => {
    console.log("personal_sign signature=", data)
    $message.success("personal_sign success")
  }).catch(err => {
    console.log("personal_sign err=", err)
    $message.error("personal_sign fail," + err.message)
  })
}

function eth_sign() {
  const req = {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_sign',
    params: [data.accounts[0], '0xwangcy']
  }
  connector.sendCustomRequest(req).then(data => {
    console.log("eth_sign signature=", data)
    $message.success("personal_sign success")
  }).catch(err => {
    console.log("eth_sign err=", err)
    $message.error("eth_sign fail," + err.message)
  })
}

function eth_signTransaction() {
  const tx = {
    from: data.accounts[0], // Required
    // from: '0xd46e8dd67c5d32be8058bb8eb970870f07244567', // Required
    to: data.accounts[0], // Required
    value: '0x999999999999999999', // Required
    data: '0xddd', // Required
  }

  connector.signTransaction(tx).then(signature => {
    console.log("eth_signTransaction signature=", signature)
    $message.success("eth_signTransaction success")
  }).catch(err => {
    console.log("eth_signTransaction err=", err)
    $message.error("eth_signTransaction fail," + err.message)
  })

  // const req = {
  //   id: 1,
  //   jsonrpc: '2.0',
  //   method: 'eth_signTransaction',
  //   params: [tx]
  // }
  // connector.sendCustomRequest(req).then(data => {
  //   console.log("eth_signTransaction signature=", data)
  //   $message.success("eth_signTransaction success")
  // }).catch(err => {
  //   console.log("eth_signTransaction err=", err)
  //   $message.error("eth_signTransaction fail," + err.message)
  // })
}

function eth_sendRawTransaction() {
  const req = {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_sendRawTransaction',
    params: ["0xf86d820144843b9aca0082520894b78777860637d56543da23312c7865024833f7d188016345785d8a0000802ba0e2539a5d9f056d7095bd19d6b77b850910eeafb71534ebd45159915fab202e91a007484420f3968697974413fc55d1142dc76285d30b1b9231ccb71ed1e720faae"]
  }
  connector.sendCustomRequest(req).then(data => {
    console.log("eth_sendRawTransaction txHash=", data)
    $message.success("eth_sendRawTransaction success")
  }).catch(err => {
    console.log("eth_sendRawTransaction err=", err)
    $message.error("eth_sendRawTransaction fail," + err.message)
  })
}


function wallet_switchEthereumChain() {
  const req = {
    id: 1,
    jsonrpc: '2.0',
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: "0x38" }],
  }
  connector.sendCustomRequest(req).then(data => {
    console.log("wallet_switchEthereumChain success=", data)
    $message.success("wallet_switchEthereumChain success")
  }).catch(err => {
    console.log("wallet_switchEthereumChain err=", err)
    $message.error("wallet_switchEthereumChain fail," + err.message)
  })
}



</script>

<template>
  <div class="wrap">
    <div>
      <button @click="getUri">get wc uri</button>
    </div>
    <div id="wcuri" style="display:none">{{ data.uri }}</div>
    <div v-if="data.connected" style="display:flex; gap: 5px;">
      <span>[chainId: {{ data.chainId }}]</span>
      <span>accounts: {{ data.accounts }}</span>
      <button @click="disconnect">disconnect</button>
    </div>
    <div v-if="data.connected">
      <button @click="sendTransaction">sendTransaction</button>
    </div>
    <div v-if="data.connected">
      <button @click="signTypedData">signTypedData</button>
    </div>
    <div v-if="data.connected">
      <button @click="personal_sign">personal_sign</button>
    </div>
    <div v-if="data.connected">
      <button @click="eth_sign">eth_sign</button>
    </div>
    <div v-if="data.connected">
      <button @click="eth_signTransaction">eth_signTransaction</button>
    </div>
    <div v-if="data.connected">
      <button @click="eth_sendRawTransaction">eth_sendRawTransaction</button>
    </div>
    <div v-if="data.connected">
      <button @click="wallet_switchEthereumChain">wallet_switchEthereumChain</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrap {
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  justify-items: center;
  align-items: center;
}
</style>