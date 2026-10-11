body {
    background: radial-gradient(circle at center, #2c3e50, #000000);
    height: 100vh; margin: 0; display: flex; justify-content: center; align-items: center;
    font-family: 'Segoe UI', Tahoma, sans-serif;
}

.game-board { display: flex; flex-direction: column; gap: 40px; align-items: center; }

.deck-area { display: flex; gap: 30px; }

/* استایل کارت‌ها */
.card {
    width: 70px; height: 100px; border-radius: 12px;
    background: white; display: flex; justify-content: center; align-items: center;
    font-size: 24px; font-weight: bold; cursor: pointer;
    box-shadow: 0 0 15px rgba(255,255,255,0.2);
    transition: 0.3s;
}

#deck {
    border: 2px dashed #fff; color: #fff; background: rgba(255,255,255,0.1);
    width: 70px; height: 100px; border-radius: 12px; display: flex;
    justify-content: center; align-items: center; font-size: 30px;
}

.hand-area {
    display: flex; gap: 10px; padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px; backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.1);
}

/* رنگ‌بندی نئونی */
.red { border: 2px solid #ff4d4d; box-shadow: 0 0 20px #ff4d4d; color: #ff4d4d; }
.blue { border: 2px solid #4d79ff; box-shadow: 0 0 20px #4d79ff; color: #4d79ff; }
.green { border: 2px solid #2ecc71; box-shadow: 0 0 20px #2ecc71; color: #2ecc71; }
.yellow { border: 2px solid #f1c40f; box-shadow: 0 0 20px #f1c40f; color: #f1c40f; }
