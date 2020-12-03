import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from './models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  private client: Client;

  conectado: boolean = false;

  mensaje: Mensaje = new Mensaje();

  mensajes: Mensaje[] = [];

  constructor() {}

  ngOnInit(): void {
    this.client = new Client();
    this.client.webSocketFactory = () => {
      return new SockJS('http://localhost:8080/chat-websocket');
    };

    this.client.onConnect = (frame) => {
      // frame object contains all the information of the connection with the broker.
      console.log('Conectados: ' + this.client.connected + ' : ' + frame);
      this.conectado = true;

      // "subscribe" can be taken also as "listen" to an event.
      this.client.subscribe('/chat/mensaje', e => {
        // This is a message written by someone which in turn was received by the broker and then sent to the clients.
        let mensaje: Mensaje = JSON.parse(e.body) as Mensaje;
        this.mensajes.push(mensaje);
        console.log(mensaje);
      })
    };

    this.client.onDisconnect = (frame) => {
      console.log('Desconectados: ' + !this.client.connected + ' : ' + frame);
      this.conectado = false;
    };

  }

  conectar(): void {
    // Starts the connection
    this.client.activate();
  }

  desconectar(): void {
    this.client.deactivate();
  }

  enviarMensaje(): void {
    this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
    this.mensaje.texto = '';
  }

}
