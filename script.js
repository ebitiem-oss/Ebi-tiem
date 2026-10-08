body {
    margin: 0;
    padding: 0;
    /* تم آسمان ابری و رویایی */
    background: linear-gradient(180deg, #8ec5fc 0%, #e0c3fc 100%);
    height: 100vh;
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

/* میز بازی */
#table {
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    position: relative;
    backdrop-filter: blur(15px);
    border: 3px solid rgba(255,255,255,0.5);
    margin: 20px;
}

/* استایل کارت‌های Uno */
.card {
    width: 60px;
    height: 90px;
    border-radius: 10px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    border: 3px solid white;
    cursor: pointer;
}

/* بیضی سفید وسط کارت */
.card .oval {
    width: 75%;
    height: 80%;
    background: white;
    border-radius: 50%;
    transform: rotate(-15deg);
    position: absolute;
}

.card .value {
    z-index: 1;
    font-weight: 900;
    font-size: 22px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

/* رنگ کارت‌ها */
.red { background-color: #e74c3c; }
.blue { background-color: #3498db; }
.green { background-color: #2ecc71; }
.yellow { background-color: #f1c40f; }

/* چیدمان بازیکنان */
.player-slot {
    position: absolute;
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-weight: bold;
    border: 2px solid transparent;
}

#player-hand {
    position: fixed;
    bottom: 20px;
    display: flex;
    gap: 5px;
    overflow-x: auto;
    padding: 10px;
    max-width: 90%;
        }
