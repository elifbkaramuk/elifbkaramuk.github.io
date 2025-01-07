// Hayvan figürleri
const easyCards = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼","🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
const mediumCards = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🦄", "🐮","🐶", "🐱", "🐭", "🐹", 
    "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🦄", "🐮"];
const hardCards = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🦄", "🐮", "🐵", "🐸", "🐧", "🐔",
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🦁", "🐯", "🦄", "🐮", "🐵", "🐸", "🐧", "🐔"];

let cards = [];
let timer; 
let seconds=0;
let remainingTime = 0;  // Kalan zamanı saklamak için değişken
const maxTime = 121; // 2 dakika (120 saniye)
let score = 0;
let flippedCards = [];
let flippedIndexes = [];
let matchedPairs = 0;
let totalPairs = 0;
let gamePaused = false;

let playerName = '';
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || { easy: [], medium: [], hard: [] };


// Kartları karıştırma
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Kartları yerleştirme
function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    shuffleArray(cards);

    // Seviye bazlı sütun sayısını ayarlama
    let columns = 4; // Default (Kolay seviye)
    if (cards.length > 8) columns = 6; // Orta seviye
    if (cards.length > 12) columns = 8; // Zor seviye

    // Grid yapısını dinamik olarak ayarlama
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 120px)`;

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.setAttribute('data-card', card);
        cardElement.setAttribute('data-index', index);
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
        totalPairs++;
    });
}

function flipCard(event) {
    if (gamePaused) return;  // Oyun duraklatıldığında kart çevirme engellenir

    const cardElement = event.target;
    if (flippedCards.length === 2 || cardElement.classList.contains('flipped')) return;

    cardElement.classList.add('flipped');
    cardElement.innerHTML = cardElement.getAttribute('data-card');
    flippedCards.push(cardElement);
    flippedIndexes.push(cardElement.getAttribute('data-index'));

    playSound('flip');

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// Kartları karşılaştırmak
function checkMatch() {
    if (flippedCards[0].getAttribute('data-card') === flippedCards[1].getAttribute('data-card')) {
        playSound('match');
        score += 10;
        document.getElementById('score').textContent = `Skor: ${score}`;
        matchedPairs++;
        flippedCards = [];
        flippedIndexes = [];

        // Eğer tüm kartlar eşleştiyse, oyun bitiyor
        if (matchedPairs === totalPairs / 2) {
            clearInterval(timer);
            endGame('Tebrikler, Kazandınız!');
        }
    } else {
        playSound('mismatch');
        setTimeout(() => {
            flippedCards.forEach(card => {
                card.classList.remove('flipped');
                card.innerHTML = '';
            });
            flippedCards = [];
            flippedIndexes = [];
        }, 1000);
    }
}

// Ses efektleri
function playSound(type) {
    const sound = new Audio(`sounds/${type}.mp3`);
    sound.play();
}

// Zamanlayıcıyı başlatmak
function startTimer() {
    seconds = 0;
    timer = setInterval(() => {
        seconds++;
        document.getElementById('timer').textContent = `Süre: ${maxTime - seconds}`;

        // Eğer süre dolmuşsa, oyunu sonlandır
        if (seconds >= maxTime) {
            clearInterval(timer); // Zamanlayıcıyı durdur
            endGame('Süreniz Doldu, Oyun Bitti!'); // Oyun bitiş mesajını göster
        }
    }, 1000);
}

// Liderlik tablosunu güncelleyen bir fonksiyon
function updateLeaderboard() {
    const difficulty = document.getElementById('difficulty').value;
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    const topPlayers = leaderboard[difficulty].slice(0, 5);
    topPlayers.forEach((player, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}. ${player.name} - Süre: ${player.time} saniye`;
        leaderboardList.appendChild(listItem);
    });
}


// Oyunu başlatmak
document.getElementById('start-button').addEventListener('click', function() {
    const nameInput = document.getElementById('player-name').value.trim();
    if (!nameInput) {
        alert('Lütfen adınızı girin!');
        return;
    }
    playerName = nameInput;

    const difficulty = document.getElementById('difficulty').value;
    switch (difficulty) {
        case 'easy':
            cards = easyCards.slice();
            break;
        case 'medium':
            cards = mediumCards.slice();
            break;
        case 'hard':
            cards = hardCards.slice();
            break;
    }

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    createBoard();
    startTimer();
});


// Oyun bittiğinde skoru kaydetme
function endGame(message) {
    document.getElementById('end-message').textContent = message;
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';

    const difficulty = document.getElementById('difficulty').value;
    const playerScore = {
        name: playerName,
        time: seconds
    };

    // Skoru zorluk seviyesine göre kaydetme
    leaderboard[difficulty].push(playerScore);
    leaderboard[difficulty].sort((a, b) => a.time - b.time);

    // Yerel depolama (localStorage) güncelleme
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Skor tablosunu güncelleme
    updateLeaderboard();
}


// Yeniden başlat
document.getElementById('restart-button').addEventListener('click', function() {
    matchedPairs = 0;
    seconds = 0;
    score = 0;
    document.getElementById('timer').textContent = `Süre: 0`;
    document.getElementById('score').textContent = `Skor: 0`;
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
});

// Durdur butonuna tıklama
document.getElementById('pause-button').addEventListener('click', function() {
    clearInterval(timer); // Zamanlayıcıyı durdur
    document.getElementById('game-container').style.display = 'none'; // Oyun alanını gizle
    document.getElementById('pause-screen').style.display = 'block'; // Oyun duraklatıldığında ekranı göster
    gamePaused = true; // Oyunun duraklatıldığını belirtiyoruz
});

// Devam et butonuna tıklama
document.getElementById('resume-button').addEventListener('click', function() {
    document.getElementById('pause-screen').style.display = 'none'; // Duraklatma ekranını gizle
    document.getElementById('game-container').style.display = 'block'; // Oyun alanını göster
    startTimer(); // Zamanlayıcıyı yeniden başlat
    gamePaused = false; // Oyunu devam ettiriyoruz
});

// Ana sayfaya dönme butonuna tıklama (oyun bitiminde)
document.getElementById('back-to-home').addEventListener('click', function() {
    // Skoru ve süreyi sıfırla
    score = 0;
    seconds = 0;
    document.getElementById('timer').textContent = `Süre: 0`;
    document.getElementById('score').textContent = `Skor: 0`;
    
    // Ekranları değiştir
    document.getElementById('end-screen').style.display = 'none'; // Oyun bitti ekranını gizle
    document.getElementById('start-screen').style.display = 'block'; // Başlangıç ekranını göster
    
});

// Duraklatıldığında ana sayfaya dönme butonuna tıklama
document.getElementById('back-to-home-pause').addEventListener('click', function() {
    // Skoru ve süreyi sıfırla
    score = 0;
    seconds = 0;
    document.getElementById('timer').textContent = `Süre: 0`;
    document.getElementById('score').textContent = `Skor: 0`;
    
    // Ekranları değiştir
    document.getElementById('pause-screen').style.display = 'none'; // Duraklatma ekranını gizle
    document.getElementById('start-screen').style.display = 'block'; // Başlangıç ekranını göster

    // Oyunu duraklatma durumunu sıfırla
    gamePaused = false; 
});

