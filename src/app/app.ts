import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { WebSocketService, NotificacionDTO } from './core/services/websocket.service';
import { AlertService } from './core/services/alert';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected title = 'biblioteca-front';
  private destroy$ = new Subject<void>();

  constructor(
    private websocketService: WebSocketService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.setupNotificationListener();
  }

  private setupNotificationListener(): void {
    this.websocketService
      .getNotificaciones()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notificacion: NotificacionDTO | null) => {
        if (notificacion) {
          this.handleNotification(notificacion);
        }
      });
  }

  private handleNotification(notificacion: NotificacionDTO): void {
    const { tipo, mensaje } = notificacion;

    switch (tipo) {
      case 'PRESTAMO_APROBADO':
        this.alertService.successToast(`✅ ${mensaje}`);
        break;

      case 'PRESTAMO_RECHAZADO':
        this.alertService.errorToast(`❌ ${mensaje}`);
        break;

      case 'PRESTAMO_CREADO':
        this.alertService.infoToast(`ℹ️ ${mensaje}`);
        break;

      case 'PRESTAMO_DEVUELTO':
        this.alertService.successToast(`📚 ${mensaje}`);
        break;

      case 'PRESTAMO_VENCIDO':
        this.alertService.warningToast(`⚠️ ${mensaje}`);
        break;

      default:
        this.alertService.infoToast(mensaje);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
