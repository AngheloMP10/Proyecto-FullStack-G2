import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

export interface NotificacionDTO {
  tipo: string;
  mensaje: string;
  prestamoId: number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client!: Client;
  private notificacionesSubject = new BehaviorSubject<NotificacionDTO | null>(null);
  private stompSubscription!: StompSubscription;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    this.client = new Client({
      brokerURL: '',
      connectHeaders: {},
      debug: (msg: string) => console.log('STOMP Debug:', msg),
      reconnectDelay: this.RECONNECT_DELAY,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.webSocketFactory = () => {
      const wsUrl = `${environment.apiUrl}/ws`;
      return new SockJS(wsUrl) as any;
    };

    this.client.onConnect = () => this.onConnected();
    this.client.onStompError = (frame) => this.onError(frame);
    this.client.onDisconnect = () => this.onDisconnected();
  }

  connect(): void {
    if (this.isConnected) {
      console.warn('WebSocket ya está conectado');
      return;
    }

    try {
      this.client.activate();
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.stompSubscription) {
      this.stompSubscription.unsubscribe();
    }

    if (this.client && this.isConnected) {
      this.client.deactivate();
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  getNotificaciones(): Observable<NotificacionDTO | null> {
    return this.notificacionesSubject.asObservable();
  }

  private onConnected(): void {
    console.log('WebSocket conectado exitosamente');
    this.isConnected = true;
    this.reconnectAttempts = 0;

    this.stompSubscription = this.client.subscribe(
      '/topic/notificaciones',
      (message: IMessage) => this.handleMessage(message)
    );
  }

  private onError(frame: any): void {
    console.error('Error en STOMP:', frame);
    this.isConnected = false;
    this.scheduleReconnect();
  }

  private onDisconnected(): void {
    console.log('WebSocket desconectado');
    this.isConnected = false;
  }

  private handleMessage(message: IMessage): void {
    try {
      const notificacion: NotificacionDTO = JSON.parse(message.body);
      this.notificacionesSubject.next(notificacion);
    } catch (error) {
      console.error('Error procesando mensaje WebSocket:', error, message.body);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Reintentando conexión WebSocket (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => this.connect(), this.RECONNECT_DELAY);
    } else {
      console.error('Máximo número de reintentos de conexión alcanzado');
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
