const uuid = require('uuid/v4');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const settings = require('./settings');


// Instanciation du serveur web, de Express et de Socket.io
const app = express();
const server = http.Server(app);
const io = socketio(server);

// Lancement du serveur HTTP
server.listen(settings.port, () => {
    console.log('Listening on port ' + settings.port);
});

// Contenu du dossier public accessible sur le web
app.use('/', express.static(__dirname + '/public'));

// Liste des connectés
const users = [];

// Connexion des clients socket.io
io.on('connection', (socket) => {
    console.log('User (' + socket.id + ') vient de se connecter');

        // Ajout d'un connecté
    const user = {
        id: socket.id,
        // Nom au hasard dans la liste des noms par défaut
        nickname: settings.defaultNicknames[Math.floor(Math.random() * settings.defaultNicknames.length)],
        // Position initiale du user à l'écran
        position: {
            x: Math.random() * 100,
            y: Math.random() * 100
        }
    };
    users.push(user);

    // Diffusion de la liste de connectés à tout le monde
    io.emit('users', users);


    // Déconnexion de l'utilisateur
    socket.on('disconnect', () => {
        console.log('User (' + socket.id + ') vient de se déconnecter');
        // Suppression du user de la liste
        users.splice(users.indexOf(user), 1);
        // Diffusion de la liste de connectés à tout le monde
        io.emit('users', users);
    });

    // Réception d'un nouveau message
    socket.on('msg', (txt) => {

        // Ajout d'un message
        const message = {
            id : uuid(),
            userId: user.id,
            txt: txt,
            date: new Date().getTime(),
        };
        // Diffusion du message auprès de tous les connectés
        io.emit('msg', message);

        socket.on('nick',(nickname) => {
            user.nickname = nickname;
            io.emit('users', users);
        });

    });

});
