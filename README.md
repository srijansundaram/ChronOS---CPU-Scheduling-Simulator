# 🧠 ChronOS – CPU Scheduling Simulator

**ChronOS** is an interactive web-based simulator for visualizing **CPU Scheduling Algorithms**.  
It helps students, developers, and OS enthusiasts understand how scheduling works inside an operating system,  
complete with Gantt charts, metrics, and algorithm comparisons.

---

## ⚙️ Features

- 🎛️ Supports **5 major scheduling algorithms**:
  - FCFS (First Come First Serve)
  - SJF (Preemptive & Non-Preemptive)
  - Priority Scheduling
  - Round Robin (Quantum configurable)
- 🧩 **Dynamic Gantt Chart Visualization** using D3.js
- 💾 **Performance Metrics**
  - Avg Waiting & Turnaround Time
  - CPU Utilization, Throughput, Context Switches
- 🔄 **Multi-core Simulation Mode**
- 🌗 **Light & Dark Theme**
- 📊 **Algorithm Comparison Mode**
- 📄 **Export Report as PDF**

---

## 🚀 Live Demo

🔗 **(Add your Netlify or GitHub Pages link here once deployed)**

---

## 🧰 Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Frontend      | HTML5, CSS3, JavaScript (Vanilla) |
| Visualization | D3.js                             |
| PDF Export    | jsPDF                             |
| Deployment    | Netlify / GitHub Pages            |

---

## 📁 Folder Structure

```
chronos/
├── index.html
├── css/
│ └── style.css
├── js/
│ ├── algorithms.js
│ ├── visualize.js
│ ├── metrics.js
│ ├── compare.js
│ ├── export.js
│ ├── utils.js
│ └── main.js
├── README.md
└── LICENSE
```

---

## 🧪 How to Run Locally

```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-username>/chronos.git

# 2️⃣ Open the folder
cd chronos

# 3️⃣ Run locally
# Just open index.html in your browser

```

That’s it — no dependencies or build tools required 🚀
🧩 Future Enhancements
Add Process Synchronization demo
Add Disk Scheduling (FCFS, SSTF, SCAN) module
Integration with WebAssembly for speed metrics

📜 License

This project is licensed under the MIT License — see LICENSE
for details.

👨‍💻 Author

Srijan

Designed & Developed with ❤️ as part of Operating Systems coursework
