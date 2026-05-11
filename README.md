# VoteX — Decentralized Voting DApp with Token Purchase

A full-stack decentralized voting application built on the **Ethereum Sepolia Testnet**. VoteX allows citizens to register as voters or candidates, purchase ERC-20 voting tokens from a marketplace, cast votes on-chain, and view real-time election results — all managed transparently through smart contracts.

---

## 🌐 Live Smart Contracts (Sepolia Testnet)

| Contract | Address |
|---|---|
| **VoteX Token (ERC-20)** | `0xFc511329C26b012E79c6Ea059d43F4d245E2340A` |
| **Token Marketplace** | `0x8E3d618A91E02414b1111F6780F1eE372390815a` |
| **Voting** | `0x3518289db012C04C0b945Cc3F187baC4Ad0D31af` |

---

## ✨ Features

### 👤 Role-Based Dashboard
- **Voter:** Register, buy tokens from the marketplace, cast votes.
- **Candidate:** Register with a photo, appear on the candidate list.
- **Election Commissioner (EC):** Set voting time period, declare emergency, announce and display the winner.

### 🗳️ Blockchain-Powered Voting
- All voter/candidate registrations and votes are recorded immutably on the Ethereum blockchain.
- Smart contract enforces one-vote-per-wallet.

### 🏪 Token Marketplace
- Voters purchase ERC-20 VoteX tokens to participate in elections.
- Token price is fetched live from the smart contract.
- Supports buying and selling tokens.

### 🖼️ Cloud Image Storage
- Profile photos for voters and candidates are uploaded to **Cloudinary**.
- No images are ever stored on the server, making the backend fully cloud-deployment ready.

### 🔐 Wallet Authentication
- Users connect their MetaMask wallet and sign a message to prove ownership.
- A **JWT token** is issued by the backend upon verification, securing all subsequent API calls.

### 📊 Live Election Status
- The sidebar displays a live badge: **Upcoming / Live Now / Election Ended**, fetched directly from the smart contract.

---

## 🏗️ Architecture

```
Voting DApp/
├── VotingLive/       # React Frontend (Vite)
└── VotingServer/     # Node.js Backend (Express)
```

---

## 🔧 Tech Stack

### Frontend (`VotingLive`)
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | UI Framework |
| **Ethers.js v6** | Blockchain interaction |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS + shadcn/ui** | Styling & components |
| **Lucide React** | Icons |
| **Axios** | HTTP requests |
| **React Hot Toast** | Notifications |

### Backend (`VotingServer`)
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database for user metadata |
| **Cloudinary** | Cloud image storage |
| **Multer** | File upload handling (memory storage) |
| **JSON Web Token (JWT)** | Authentication |
| **ethers.js v5** | Signature verification |

### Blockchain
| Technology | Purpose |
|---|---|
| **Ethereum (Sepolia Testnet)** | Blockchain network |
| **Solidity** | Smart contract language |
| **MetaMask** | Browser wallet |

---

## 📁 Project Structure

```
VotingLive/src/
├── components/
│   ├── ElectionCommision/    # EC panel components (voting period, winner, emergency)
│   ├── ElectionStatus/       # Election banner
│   ├── Layout/               # Sidebar layout
│   ├── Navigation/           # Role-based sidebar navigation
│   ├── RoleSelection/        # Role selection dashboard
│   ├── TokenMarketplace/     # Buy/Sell/Deposit token components
│   ├── Voter/                # Cast vote component
│   ├── Wallet/               # Wallet connection page
│   └── ui/                   # Reusable UI components (shadcn)
├── context/                  # Web3 context (provider, hook)
├── hooks/                    # Custom hooks (useIsCommissioner)
├── pages/
│   ├── Candidate/            # Register & List candidates
│   ├── ElectionCommision/    # EC panel page
│   ├── TokenMarketplace/     # Marketplace page
│   └── Voter/                # Register & List voters
├── routes/                   # React Router configuration
└── utils/                    # API helpers (upload, delete, web3 state)

VotingServer/
├── cloudinary.js             # Cloudinary config & upload helpers
├── index.js                  # Express app entry point
├── db/connect.js             # MongoDB connection
├── middlewares/
│   ├── authentication.js     # JWT verification middleware
│   └── multer.js             # Memory-storage file upload
├── models/
│   ├── VoterSchema.js        # Voter MongoDB schema
│   └── CandidateSchema.js    # Candidate MongoDB schema
└── routes/
    ├── authenticationRoute.js # Wallet signature auth → JWT
    ├── voterRoutes.js         # Upload/Get/Delete voter image
    └── candidateRoutes.js     # Upload/Get/Delete candidate image
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension (connected to Sepolia testnet)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)
- [Cloudinary](https://cloudinary.com/) account

---

### 1. Clone the Repository

```bash
git clone https://github.com/OmRatnaparkhe/VoteX--Voting-DApp-with-Token-purchase.git
cd VoteX--Voting-DApp-with-Token-purchase
```

---

### 2. Setup the Backend (`VotingServer`)

```bash
cd VotingServer
npm install
```

Create a `.env` file in `VotingServer/`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

Start the backend server:

```bash
npm run start
# Server runs on http://localhost:3000
```

---

### 3. Setup the Frontend (`VotingLive`)

```bash
cd ../VotingLive
npm install
```

Create a `.env` file in `VotingLive/`:

```env
VITE_CONTRACT_ADDRESS=0x3518289db012C04C0b945Cc3F187baC4Ad0D31af
VITE_COMMISSIONER_ADDRESS=your_deployer_wallet_address
```

Start the frontend:

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Environment Variables Reference

### `VotingServer/.env`
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_URL` | Full Cloudinary URL (from your dashboard) |

### `VotingLive/.env`
| Variable | Description |
|---|---|
| `VITE_CONTRACT_ADDRESS` | Deployed Voting contract address |
| `VITE_COMMISSIONER_ADDRESS` | Wallet address of the Election Commissioner |

---

## 🗺️ User Flow

```
Connect Wallet (MetaMask)
        │
        ▼
  Sign Message → Backend issues JWT
        │
        ▼
  Select Role (Voter / Candidate / Commissioner)
        │
  ┌─────┼──────────────────────┐
  │     │                      │
  ▼     ▼                      ▼
Voter  Candidate         Commissioner
  │     │                      │
  │  Register + Upload Photo   │
  │     │               Set Voting Period
  │     │               Announce Winner
  ▼     │
Buy Tokens from Marketplace
  │
  ▼
Cast Vote → Transaction on Sepolia
  │
  ▼
View Results
```

---

## 🔒 Security Notes

- Voter/Candidate registrations on the blockchain are **permanent and immutable**.
- Server-side metadata (photos) can be deleted via the "Danger Zone" in the registration panel — but the on-chain record remains.
- The Election Commissioner panel is gated by a wallet address comparison in the frontend (`VITE_COMMISSIONER_ADDRESS`).
- All backend routes that modify data are protected by JWT middleware.

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/authentication?accountAddress=` | Verify wallet signature, return JWT |

### Voter
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/postVoterImage` | Upload voter profile image (auth required) |
| `GET` | `/api/getVoterImage/:address` | Fetch voter image (redirects to Cloudinary) |
| `DELETE` | `/api/deleteVoterRegistration` | Delete voter metadata & image (auth required) |

### Candidate
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/postCandidateImage` | Upload candidate profile image (auth required) |
| `GET` | `/api/getCandidateImage/:address` | Fetch candidate image (redirects to Cloudinary) |
| `DELETE` | `/api/deleteCandidateRegistration` | Delete candidate metadata & image (auth required) |

---

## 🌩️ Deployment

### Backend → [Render](https://render.com/)
1. Push `VotingServer` to a GitHub repo.
2. Create a new **Web Service** on Render.
3. Add environment variables: `MONGO_URI`, `CLOUDINARY_URL`.
4. Set start command: `node index.js`.

### Frontend → [Vercel](https://vercel.com/)
1. Push `VotingLive` to a GitHub repo.
2. Import project on Vercel (auto-detects Vite).
3. Add environment variables: `VITE_CONTRACT_ADDRESS`, `VITE_COMMISSIONER_ADDRESS`, and your backend URL.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

ISC

---

<p align="center">Built with ❤️ on the Ethereum Blockchain</p>
