body {
    margin: 0; padding: 0;
    background: linear-gradient(180deg, #8ec5fc 0%, #e0c3fc 100%);
    height: 100vh;
    font-family: sans-serif;
    display: flex; justify-content: center; align-items: center;
    overflow: hidden;
}

#table {
    width: 300px; height: 300px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    position: relative;
    backdrop-filter: blur(10px);
    border: 3px solid rgba(255,255,255,0.4);
}

.card {
    width: 50px; height: 75px;
    border-radius: 8px; border: 3px solid white;
    display: flex; justify-content: center; align-items: center;
    position: relative; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

/* حلقه نوبت */
.player-slot {
    position: absolute;
    width: 50px; height: 50px;
    background: white; border-radius: 50%;
    display: flex; justify-content: center; align-items: center;
    font-size: 10px; font-weight: bold;
    transition: all 0.5s ease;
    border: 3px solid transparent; /* وضعیت عادی */
}

/* وقتی نوبت بازیکن است (حلقه درخشان) */
.player-slot.active {
    border-color: #fff;
    box-shadow: 0 0 15px #fff, 0 0 20px #ff00ff;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

#player-hand {
    position: fixed; bottom: 20px;
    display: flex; gap: 5px;
    overflow-x: auto; padding: 10px;
    max-width: 90%;
}
.red { background-color: #e74c3c; }
.blue { background-color: #3498db; }
.green { background-color: #2ecc71; }
.yellow { background-color: #f1c40f; }
    
