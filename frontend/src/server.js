const express = require('express');
const path = require('path');
const session = require('express-session'); 
const routes = require('./routes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, '../public')));

const users = [
  { email: 'test@example.com', password: 'testpassword' },
  { email: 'admin@example.com', password: 'adminpass' }
]

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();  
  }
  res.redirect('/login');  
}

app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    req.session.user = user;
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: 'Неверный email или пароль.' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Ошибка выхода');
    }
    res.redirect('/login');
  });
});

app.get('/', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'main.html'));
});

app.get('/skills', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'skills.html'));
});

app.use(routes);

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
