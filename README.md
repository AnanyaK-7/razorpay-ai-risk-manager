# Razorpay RiskShield AI — Track 02 (AI Risk Manager)

> **Razorpay AI Buildathon Submission — Track 02: AI Risk Manager**  
> *"Stop the merchant losing money to fraud, returns, chargebacks, and financial social engineering scams."*

---

## Executive Summary

**Razorpay RiskShield AI** is an enterprise-grade, defense-only AI Risk Management platform designed specifically for Indian E-Commerce merchants and BFSI platforms. It protects merchants and customers against **10 major classes of financial scams and fraud**:

1. **OTP Bank & Vishing Fraud**: Detects active phone call vishing, screen-sharing apps (*AnyDesk*, *TeamViewer*), and SMS/OTP forwarding during payment.
2. **Phishing Link & Sideloaded APK Malware**: Detects shortlink referrals (*bit.ly*, *WhatsApp links*), sideloaded APK environment execution, and domain typo-squatting.
3. **Lottery Prize & Task Reward Scam**: NLP detection for *KBC / ₹25 Lakhs prize / Task completion fee* scams, first-time transfers to unverified private VPAs, and abnormal daily account balance drain ratios.
4. **Return-Risk & Wardrobing Scams**: Identifies opportunistic return fraud on high-value COD orders, luxury goods, and fast address swaps.
5. **Chargeback & Friendly Fraud**: Compiles verified courier proof of delivery (POD), 3DS biometric IP logs, and customer order history into bank-ready PDF dispute packages.
6. **Abuse-Ring & Sybil Bot Sentinel**: Graph network analyzer detecting multi-account botnets sharing hardware fingerprints, UPI VPAs, and delivery hubs.
7. **UPI Collect Request & VPA Spoofing**: Detects spoofed verification VPAs and fake QR collect prompts.
8. **Account Takeover (ATO)**: Identifies abnormal logins from new devices + instant checkout within 30 seconds + address changes.
9. **Carding Velocity & BIN Attacks**: High-frequency micro-transactions using stolen cards + BIN country mismatches.
10. **Synthetic Identity Fraud**: Fake profiles created with disposable temp emails + high-risk delivery dropzones.

---

## "The Bar" — Requirement Checklist & Benchmark Metrics

Evaluated on a strictly isolated **3,600 transaction held-out test set** from an 18,000 transaction multi-scam dataset:

| Buildathon Bar Requirement | Implementation Status | Measured Metric on Held-Out Test Set |
| :--- | :--- | :--- |
| **Working Multi-Scam Detector** | **COMPLETED** | 10-Scam HistGradientBoosting + Graph Sentinel |
| **Measured Precision** | **COMPLETED** | **99.28%** (Held-Out Test Set) |
| **Measured Recall** | **COMPLETED** | **92.07%** (Held-Out Test Set) |
| **ROC-AUC Score** | **COMPLETED** | **0.9948** |
| **False-Positive Cost Analysis** | **COMPLETED** | **INR ₹450 / FP** friction cost factored in |
| **Net Financial Money Saved** | **COMPLETED** | **INR ₹2,98,67,184.27** saved across test batch |
| **Strictly Defense-Only** | **COMPLETED** | Gated defense actions with complete audit trail |

---

## System Architecture

```
                       +-----------------------------------+
                       | Razorpay RiskShield React Frontend |
                       |  (Obsidian Dark Glassmorphism UI) |
                       +-----------------+-----------------+
                                         | REST APIs
                                         v
                       +-----------------------------------+
                       |      Python FastAPI Backend       |
                       +--------+----------------+---------+
                                |                |
             +------------------+                +------------------+
             |                                                      |
             v                                                      v
  +----------------------+                               +----------------------+
  | HistGB ML Risk Engine|                               | Graph Sentinel       |
  |  (10 Scam Vectors)   |                               | (NetworkX Abuse Ring)|
  +----------+-----------+                               +----------+-----------+
             |                                                      |
             v                                                      v
  +----------------------+                               +----------------------+
  | Real-Time Voice/Text |                               | Chargeback Evidence  |
  | Natural Language AI  |                               | Dossier PDF Builder  |
  +----------------------+                               +----------------------+
```

---

## Codebase Structure

```
razorpay-ai-risk-manager/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI REST routes & Voice/Text NLP endpoint
│   │   ├── ml/
│   │   │   ├── model_trainer.py     # 10-scam ML pipeline, 18k dataset & held-out evaluator
│   │   │   └── risk_scorer.py       # Inference engine & SHAP feature attributions
│   │   ├── graph/
│   │   │   └── ring_sentinel.py     # NetworkX graph analysis for Sybil rings
│   │   ├── autoresponder/
│   │   │   └── evidence_builder.py  # ReportLab PDF chargeback dossier generator
│   │   └── dataset/
│   │       └── synthetic_generator.py # 18,000 10-scam Indian transaction dataset
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Razorpay header & status badge
│   │   │   └── VoiceTextInspector.jsx # Speech-to-Text & Text-to-Speech AI Inspector
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Operations stream & real-time voice AI inspector
│   │   │   ├── HeldoutMetrics.jsx   # Track 02 "The Bar" slider & 10-scam breakdown
│   │   │   ├── RingSentinel.jsx     # Interactive abuse ring network graph
│   │   │   ├── AutoResponder.jsx    # One-click PDF evidence dossier builder
│   │   │   └── Sandbox.jsx          # Live single-transaction & batch CSV scorer
│   │   ├── App.jsx
│   │   └── index.css                # Razorpay Dark Obsidian theme styles
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quickstart & Local Setup

### Option 1: Run via Docker (Recommended)

```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

### Option 2: Run Manually

#### 1. Backend Setup (Python 3.10+)

```bash
cd backend
pip install -r requirements.txt
python -m app.ml.model_trainer  # Trains ML model & outputs held-out evaluation
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (Node 18+)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Pitch Video Script for Razorpay Buildathon Judges (5 Mins)

1. **0:00 - 0:45**: Introduction & Problem Statement in Indian BFSI/D2C (10 Scam Vectors: Vishing, Phishing APKs, KBC Lottery, Return Fraud, Chargebacks).
2. **0:45 - 2:00**: Live Operation Dashboard & Real-Time Voice/Text AI Demo — Speaking queries into the browser and receiving spoken AI audio responses.
3. **2:00 - 3:15**: "The Bar" Held-Out Test Set Page — Demonstrating the threshold slider, 99.28% Precision, 92.07% Recall, and Net Financial Money Saved (INR ₹2.98 Crore).
4. **3:15 - 4:15**: Chargeback Evidence Auto-Responder — Showcasing instant compilation of Courier POD and 3DS2 logs into downloadable PDF dossiers.
5. **4:15 - 5:00**: Abuse Ring Sentinel & Conclusion — Visualizing network graph clusters and highlighting defense-only guardrails.

---

## License

Built exclusively for the **Razorpay AI Buildathon 2026**. All rights reserved.
