-- ================================================
-- QUICK FIX: Manually Credit Your Test Deposit
-- ================================================
-- Run this in SQLite to credit your ETH deposit

-- First, open your database:
-- sqlite3 prisma/dev.db

-- ================================================
-- Step 1: Find the user ID for this wallet address
-- ================================================

SELECT 
  w.userId,
  w.address,
  w.chain,
  u.email
FROM Wallet w
JOIN User u ON w.userId = u.id
WHERE LOWER(w.address) LIKE '%9170c53a%';

-- Note the userId from above, then run the following
-- Replace 'YOUR_USER_ID' with the actual user ID

-- ================================================
-- Step 2: Check if deposit already exists
-- ================================================

SELECT * FROM Deposit 
WHERE LOWER(txHash) LIKE '%0598ef62012%';

-- If nothing returned, proceed to create the deposit

-- ================================================
-- Step 3: Create the deposit record
-- ================================================
-- Replace YOUR_USER_ID with the actual user ID from Step 1
-- Replace the txHash with the full transaction hash from Etherscan

INSERT INTO Deposit (
  id,
  depositId,
  userId,
  userUid,
  currency,
  chain,
  network,
  amount,
  fee,
  netAmount,
  txHash,
  txUrl,
  fromAddress,
  toAddress,
  confirmations,
  requiredConfirmations,
  status,
  explorerName,
  explorerUrl,
  submittedAt,
  confirmedAt,
  completedAt,
  createdAt,
  updatedAt
) VALUES (
  'manual_eth_dep_001',                                              -- id
  'DEP20260102000001',                                               -- depositId
  'YOUR_USER_ID',                                                    -- userId (replace!)
  'YOUR_USER_ID',                                                    -- userUid (replace!)
  'ETH',                                                             -- currency
  'ETH',                                                             -- chain
  'mainnet',                                                         -- network
  0.00013266,                                                        -- amount
  0,                                                                 -- fee
  0.00013266,                                                        -- netAmount
  '0x0598ef62012...',                                                -- txHash (paste full hash!)
  'https://etherscan.io/tx/0x0598ef62012...',                        -- txUrl (paste full URL!)
  '0xb9e1e32f...4d8db3881',                                          -- fromAddress (paste full!)
  '0x9170c53aa4f4045ab90271672f962eb2ac620c6b',                      -- toAddress
  100,                                                               -- confirmations
  12,                                                                -- requiredConfirmations
  'COMPLETED',                                                       -- status
  'Etherscan',                                                       -- explorerName
  'https://etherscan.io',                                            -- explorerUrl
  datetime('now'),                                                   -- submittedAt
  datetime('now'),                                                   -- confirmedAt
  datetime('now'),                                                   -- completedAt
  datetime('now'),                                                   -- createdAt
  datetime('now')                                                    -- updatedAt
);

-- ================================================
-- Step 4: Create or update user balance
-- ================================================
-- First check if balance exists

SELECT * FROM UserBalance 
WHERE userId = 'YOUR_USER_ID' AND currency = 'ETH';

-- If exists, UPDATE:
UPDATE UserBalance 
SET 
  totalBalance = totalBalance + 0.00013266,
  available = available + 0.00013266,
  updatedAt = datetime('now')
WHERE userId = 'YOUR_USER_ID' 
  AND currency = 'ETH' 
  AND chain = 'ETH';

-- If NOT exists, INSERT:
INSERT INTO UserBalance (
  id,
  userId,
  currency,
  chain,
  network,
  totalBalance,
  available,
  locked,
  frozen,
  staked,
  earning,
  usdValue,
  createdAt,
  updatedAt
) VALUES (
  'bal_eth_' || lower(hex(randomblob(4))),   -- random id
  'YOUR_USER_ID',                             -- userId (replace!)
  'ETH',                                      -- currency
  'ETH',                                      -- chain
  'mainnet',                                  -- network
  0.00013266,                                 -- totalBalance
  0.00013266,                                 -- available
  0,                                          -- locked
  0,                                          -- frozen
  0,                                          -- staked
  0,                                          -- earning
  0.41,                                       -- usdValue (approximate)
  datetime('now'),                            -- createdAt
  datetime('now')                             -- updatedAt
);

-- ================================================
-- Step 5: Verify everything worked
-- ================================================

-- Check deposit was created
SELECT depositId, amount, currency, status FROM Deposit 
WHERE depositId = 'DEP20260102000001';

-- Check balance was updated
SELECT currency, totalBalance, available FROM UserBalance 
WHERE userId = 'YOUR_USER_ID';

-- ================================================
-- Done! Refresh your app to see the balance.
-- ================================================

-- To exit SQLite:
-- .exit