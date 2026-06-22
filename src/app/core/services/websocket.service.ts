import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export interface NotificacionDTO {
  tipo: string;
  mensaje: string;
  prestamoId: number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client!: Client;
  private stompSubscription!: StompSubscription;

  private notificacionesSubject = new BehaviorSubject<NotificacionDTO | null>(
    null,
  );

  private isConnected = false;

  private readonly WS_URL = 'ws://localhost:8080/ws';
  private readonly RECONNECT_DELAY = 3000;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = new Client({
      brokerURL: this.WS_URL,

      reconnectDelay: this.RECONNECT_DELAY,

      debug: (msg) => console.log('STOMP:', msg),

      onConnect: () => this.onConnected(),

      onStompError: (frame) => this.onError(frame),

      onWebSocketClose: () => this.onDisconnected(),
    });
  }

  connect(): void {
    if (this.isConnected) return;

    this.client.activate();
  }

  disconnect(): void {
    if (this.stompSubscription) {
      this.stompSubscription.unsubscribe();
    }

    this.client.deactivate();
    this.isConnected = false;
  }

  getNotificaciones(): Observable<NotificacionDTO | null> {
    return this.notificacionesSubject.asObservable();
  }

  private onConnected(): void {
    console.log('WebSocket conectado exitosamente');

    this.isConnected = true;

    this.stompSubscription = this.client.subscribe(
      '/topic/notificaciones',
      (message: IMessage) => this.handleMessage(message),
    );
  }

  private onError(frame: any): void {
    console.error('Error STOMP:', frame);
    this.isConnected = false;
  }

  private onDisconnected(): void {
    console.log('WebSocket desconectado');
    this.isConnected = false;
  }

  private handleMessage(message: IMessage): void {
    try {
      const data: NotificacionDTO = JSON.parse(message.body);

      console.log('NOTIFICACION RECIBIDA:', data);

      this.notificacionesSubject.next(data);
    } catch (err) {
      console.error('Error procesando mensaje:', err);
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
