# 🧭 Reclaim

<p align="center">
  <img src="./public/logo.png" alt="Reclaim Logo" width="140"/>
</p>

<p align="center">
  <b>An AI-assisted Lost & Found Reclaim System for College Campuses</b>
</p>

---

## 📌 Problem Statement

During college fests and large campus events, lost and found items are common but reclaiming them is inefficient, unverified, and often unsafe.

Reclaim solves this by combining AI-based item verification, smart matching, and a secure reclaim request flow.

---

## 💡 Solution Overview

Reclaim is a web application that enables users to:
- Report lost or found items
- Automatically analyze item images using AI
- Match lost items with found items intelligently
- Securely request and verify ownership claims

---

## ⚙️ Key Features

### 🖼️ AI Image Analysis
- Uses Google Gemini to analyze uploaded images
- Extracts item type and primary color
- Enables smarter matching beyond text descriptions

### 🔍 Smart Matching Engine
- Matches items based on item type and color
- Prevents irrelevant reclaim requests

### 🔐 Secure Reclaim Flow
- Authenticated reclaim requests
- Verification before approval

---

## 🏗️ Tech Stack

**Frontend**
- Next.js
- React
- Tailwind CSS
- Framer Motion

**Backend & Services**
- Firebase Authentication
- Firestore
- Google Gemini API (vision 2.5 flash lite)

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/reclaim.git
cd reclaim
npm install
npm run dev
```

---

## 🏆 Hackathon Project

Built for a hackathon to solve real-world campus problems using AI and secure workflows.
