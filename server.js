const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer')



const app = express();
const cors = require('cors');
app.use(cors({
    origin: 'https://whateverittakesteam.ru',
    credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// Убедимся, что папка для хранения изображений существует
const uploadsDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware для парсинга данных формы
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,            // если HTTPS (на проде обязательно)
        httpOnly: true,
        sameSite: 'none',        // важно для CORS
        maxAge: 24 * 60 * 60 * 1000 // 1 день
    }
}));



// Роуты для статических страниц
app.get('/register', (req, res) => {
     res.redirect('https://https://whateverittakesteam.ru/Register.html');
});
app.get('/profile', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/Profile.html');
});


app.get('/login', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/Register.html');
});

app.get('/buy', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/buy.html');
});
app.get('/payment', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/payment.html');
});
app.get('/about', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/aboutus.html');
});
app.get('/dashboard', (req, res) => {
    res.redirect('https://https://whateverittakesteam.ru/dashboard.html');
});

app.get('/user-info', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('Пользователь не авторизован');
    }

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения файла:', err);
            return res.status(500).send('Ошибка сервера');
        }

        try {
            const users = JSON.parse(data);
            const user = users.find(u => u.username === req.session.username);

            if (user) {
                return res.json({
                    username: user.username,
                    role: user.role,
                });
            } else {
                return res.status(404).send('Пользователь не найден');
            }

        } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});

// Функция для регистрации
app.post('/register', (req, res) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    };
  

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) throw err;

        const users = data ? JSON.parse(data) : [];

        // Проверка на существующего пользователя
        const existingUser = users.find(user => user.username === newUser.username);

        if (existingUser) {
            res.send('Пользователь с таким именем уже существует!');
        } else {
            users.push(newUser);
            fs.writeFile('data.json', JSON.stringify(users, null, 3), (err) => {
                if (err) throw err;
                res.redirect('/login'); // Перенаправление на авторизацию после успешной регистрации
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка чтения данных');
        }

        try {
            const users = JSON.parse(data);
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                req.session.username = user.username;
                req.session.role = user.role;
                req.session.loggedIn = true;

                console.log(`Роль пользователя ${user.username}: ${user.role}`);

                // Отправляем имя пользователя и роль обратно клиенту
                return res.json({ username: user.username, role: user.role || 'undefined' });
            } else {
                res.status(401).send('Неверные логин или пароль!');
            }
        } catch (err) {
            console.error('Ошибка парсинга данных:', err);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});



// Маршрут для страницы администратора
app.get('/admin-dashboard', (req, res) => {
    if (req.session.role !== 'Admin') {
        console.log("Попытка доступа к админ-панели неадминистратором.");
        
    }

   
    res.send('Добро пожаловать в панель администратора');
});



// Роут для страницы профиля
app.get('/profile', (req, res) => {
    if (!req.session.username) {
        
    }

    const username = req.session.username;
    const userGames = gameLibrary; // Здесь можно заменить на реальные данные, если они есть в базе данных

    // Отправляем HTML с данными пользователя
    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Профиль пользователя</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                ul { list-style-type: none; }
                li { margin: 10px 0; }
                .game-card { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                .game-card:hover { background-color: #f5f5f5; }
                button { padding: 10px 15px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer; }
                button:hover { background-color: #0056b3; }
            </style>
        </head>
        <body>
            <h1>Добро пожаловать, ${username}!</h1>
            <h2>Ваша библиотека игр:</h2>
            <div id="games-list">
                ${userGames.map(game => `
                    <div class="game-card">
                        <strong>${game.name}</strong> - ${game.description}
                    </div>
                `).join('')}
            </div>
            <button onclick="logout()">Выйти</button>

            <script>
                function logout() {
                    fetch('/logout', { method: 'GET' })
                        .then(response => window.location.href = '/login')
                        .catch(error => console.error('Ошибка при выходе', error));
                }
            </script>
        </body>
        </html>
    `);
});

// Логика выхода из сессии
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Ошибка при выходе');
        }
        res.json({ success: true }); // клиент сам решит, куда редиректить
    });
});


// Настройка хранения изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '/uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Маршрут для получения количества пользователей
app.get('/user-count', (req, res) => {
    // Чтение данных пользователей из файла
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка чтения данных');
        }

        try {
            const users = JSON.parse(data);  // Преобразуем JSON в массив пользователей
            const userCount = users.length;  // Получаем количество пользователей

            res.json({ count: userCount });  // Отправляем количество пользователей в ответ
        } catch (err) {
            console.error('Ошибка парсинга данных:', err);
            res.status(500).send('Ошибка парсинга данных');
        }
    });
});


// Получение всех новостей
app.get('/news', (req, res) => {
    fs.readFile('news.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Ошибка чтения новостей');
        res.json(JSON.parse(data));
    });
});

// Добавление новости
app.post('/add-news', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : ''; // Путь для клиента

    // Чтение существующих новостей
    fs.readFile('news.json', 'utf8', (err, data) => {
        let news = [];
        if (!err && data) news = JSON.parse(data); // Если новости уже есть, загружаем их

        // Создание новой записи
        const newEntry = { title, content, image: imagePath };

        // Добавляем новость в начало списка
        news.unshift(newEntry);

        // Запись в файл
        fs.writeFile('news.json', JSON.stringify(news, null, 2), (err) => {
            if (err) return res.status(500).send('Ошибка записи новости');
            res.status(200).send('Новость добавлена');
        });
    });
});




app.get('/check-session', (req, res) => {
    if (req.session.username) {
        res.json({ loggedIn: true, username: req.session.username, role: req.session.role });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/public/WhateverItTakesLauncher.zip', (req, res) => {
    const file = path.join(__dirname, 'WhateverItTakesLauncher.zip');
    res.download(file);  // Это инициирует загрузку файла
});
// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
