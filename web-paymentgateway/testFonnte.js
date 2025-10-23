import fetch from 'node-fetch';

const token = "wBb6kZQkVoYLXEtn8Qoy"; // ganti ini

const response = await fetch("https://api.fonnte.com/send", {
  method: "POST",
  headers: {
    "Authorization": token,
  },
  body: new URLSearchParams({
    target: "081807973333",
    message: "Hello from Fonnte!",
  }),
});

const result = await response.json();
console.log(result);
