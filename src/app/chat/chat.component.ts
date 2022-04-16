import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private client!: Client;

  constructor() { }

  ngOnInit() {
    this.client = new Client();
    this.client.webSocketFactory = ():any => {
      return new SockJS("http://localhost:8080/chat-websocket");
    }

    this.client.onConnect = (frame) => {
      console.log("conectados: " + this.client.connected + ' : ' + frame);
    }

    this.client.activate();
  }

}
