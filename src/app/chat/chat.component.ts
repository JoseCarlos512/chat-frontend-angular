import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from './models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private client!: Client;
  public conectado: boolean = false;
  public mensaje : Mensaje = new Mensaje();
  public mensajes : Mensaje[] = [];
  public escribiendo!: string;
  public userEscribiendo!:string;

  constructor() { }

  ngOnInit() {
    this.client = new Client();
    this.client.webSocketFactory = ():any => {
      return new SockJS("http://localhost:8080/chat-websocket");
    }

    this.client.onConnect = (frame) => {
      console.log("Conectados: " + this.client.connected + ' : ' + frame);
      this.conectado = true;

      /**
       * Se ha sucrito a chat/mensaje donde escuchar cualquier
       * cambio que se haga en el servidor a nivel del canal
       * chat/mensaje
       */
      this.client.subscribe('/chat/mensaje', e => {
        let mensaje: Mensaje = JSON.parse(e.body) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha);

        if (!this.mensaje.color && mensaje.tipo == "NUEVO_USUARIO" && this.mensaje.username == mensaje.username) {
          this.mensaje.color = mensaje.color;
        }

        this.mensajes.push(mensaje);
        console.log(mensaje)
      })


      /**
       * Se ha suscrito a otro canal chat/escrbiendo, donde se enterara
       * que usuario esta tecleando en tiempo real
       */
      this.client.subscribe('/chat/escribiendo', e => {
          this.escribiendo = e.body + " esta escribiendo...";
          this.userEscribiendo = e.body;
          setTimeout(()=> {this.escribiendo = ''}, 3000)
      })

      this.mensaje.tipo = 'NUEVO_USUARIO';
      this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});

    }

    this.client.onDisconnect = (frame) => {
      console.log("Desconectados: " + !this.client.connected + ' : ' + frame);
      this.conectado = false;
    }
  }

  conectar() {
    this.client.activate();
  }

  desconectar() {
    this.client.deactivate();
  }

  /**
   * Para mandar un mensaje con publish anteponer el
   * prefijo /app como se ha indicado en el backend
   */
  enviarMensaje(): void {
    this.mensaje.tipo = 'MENSAJE';
    this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
    this.mensaje.texto = '';
  }

  escribiendoMensaje():void {
    this.client.publish({destination: '/app/escribiendo', body: this.mensaje.username});
  }

}
