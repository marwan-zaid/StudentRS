const fetch = require('node-fetch');
const { API_URL } = require('./config');

async function login(username, password) {
  const res = await fetch(`${API_URL}?action=login&username=${username}&password=${password}`);
  const data = await res.json();
  console.log(data);
}

// اختبار
login("marwan", "100");
