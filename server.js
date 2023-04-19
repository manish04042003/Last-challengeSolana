const express = require("express");
const app = express();
app.use(express.static("public"));
const path = require("path");

const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));



// Route handler for GET request
app.get("/", function (req, res) {
  const filePath = path.join(__dirname, "public", "index.html");
  res.sendFile(filePath);
});
app.post("/api/new-account", async (req, res) => {

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Get Keypair from Secret Key
  var from = Keypair.generate();

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();

  // Aidrop 2 SOL to Sender wallet
  console.log("Airdopping some SOL to Sender wallet!");
  const fromAirDropSignature = await connection.requestAirdrop(
    new PublicKey(from.publicKey),
    2 * LAMPORTS_PER_SOL
  );

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log("Airdrop completed for the Sender account");

  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log("Signature is", signature);
});

app.listen(4242, () => console.log("Running on port 4242"));
