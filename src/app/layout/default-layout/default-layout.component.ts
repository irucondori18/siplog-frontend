import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { FormsModule } from '@angular/forms';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective,
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import { TransportistaService } from './data-access/transportista.service';
import { Transportista } from './data-access/transportista.model';
import { TransporteService } from './data-access/transporte.service';
import { Transporte } from './data-access/transporte.model';

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

declare var app: any;


@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    IconDirective,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective,
    FormsModule
  ]
})

export class DefaultLayoutComponent {
  public navItems = [...navItems];
  transportistas: Transportista[] = [];
  transportes: Transporte[] = [];
  recorridos: any[] = [];
  
  selectedFiles: any = {
    licencia: null,
    carnet: null,
    poliza: null,
    poliza_seguro: null,
    rtv: null,
    titulo: null
  };
  horaActual: string = '';
  private intervalId: any;

  ngOnInit() {
    this.actualizarHora();

    // Actualiza la hora cada 1 segundo
    this.intervalId = setInterval(() => {
      this.actualizarHora();
    }, 1000);

    // Exponer este componente al scope global
    (window as any).angularComponent = this;
    
    // Cargar transportistas al iniciar
    this.getTransportistas();
    this.getTransportes();
  }
  
  actualizarHora() {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  constructor(private transportistaService: TransportistaService, private transporteService: TransporteService) {}

  onFileSelected(event: any, tipo: 'licencia' | 'carnet' | 'poliza' | 'poliza_seguro' | 'rtv' | 'titulo') {
    this.selectedFiles[tipo] = event.target.files[0];
  }
  
  getTransportistas() {
    this.transportistaService.getTransportistas().subscribe({
      next: (data) => {
        this.transportistas = data;
        this.syncDriversToJS();
      },
      error: (err) => {
        console.error('❌ Error al cargar transportistas', err);
      },
    });
  }

    getTransportes() {
    this.transporteService.getTransportes().subscribe({
      next: (data) => {
        this.transportes = data;
        console.log('✅ Transportes cargados:', this.transportes);
        this.syncTransportsToJS();
      },
      error: (err) => {
        console.error('❌ Error al cargar transportes', err);
      },
    });
  }
  
  // Esta función sincroniza Angular → JavaScript
  syncDriversToJS() {
    const drivers = (window as any).drivers || [];
    drivers.length = 0;
    
    this.transportistas.forEach(t => {
      drivers.push({
        id: t.id,
        name: t.nombre_completo,
        dni: t.documento_identificacion,
        licencia_conducir: t.licencia_conducir,
        carnet_cargas_peligrosas: t.carnet_cargas_peligrosas,
        poliza_seguro_accidentes_personales_art: t.poliza_seguro_accidentes_personales_art
      });
    });
    
    (window as any).drivers = drivers;
    // Intentar renderizar si app está listo
    // Ejecutar render si existe
    const app = (window as any).app;
    if (app?.renderDriverList) {
      app.renderDriverList();
    }
    console.log(`Synced ${drivers.length} drivers to JS`);
  }

  syncTransportsToJS() {
    const transports = (window as any).transports || [];
    transports.length = 0;
    
    this.transportes.forEach(t => {
      transports.push({
        plate: t.patente,
        model: t.modelo,
        brand: t.marca,
        trailerType: t.acoplado,
        id: t.id
        // driver: driver.name,
        // company: driver.company || 'Empresa',
        // startLocation: form.startLocation.value,
        // direction: form.direction.value
      });
    });
    
    (window as any).transports = transports;
    // Intentar renderizar si app está listo
    // Ejecutar render si existe
    const app = (window as any).app;
    if (app?.renderFleetList) {
      app.renderFleetList();
    }
    console.log(`Synced ${transports.length} transports to JS`);
  }

  syncRecorridosToJS(fd: any) {
    const recorridos = (window as any).recorridos || [];
    // recorridos.length = 0;
    
    // this.recorridos.forEach(t => {
    //   recorridos.push({
    //     plate: t.patente,
    //     model: t.modelo,
    //     brand: t.marca,
    //     trailerType: t.acoplado,
    //     id: t.id
    //     // driver: driver.name,
    //     // company: driver.company || 'Empresa',
    //     // startLocation: form.startLocation.value,
    //     // direction: form.direction.value
    //   });
    // });
    
    (window as any).recorridos = recorridos;
    // Intentar renderizar si app está listo
    // Ejecutar render si existe
    const app = (window as any).app;
    if (app?.createRecorrido) {
      app.createRecorrido(fd);
    }

      // recorridos.push({
        
      // });


    console.log(`Synced ${recorridos.length} recorridos to JS`);
  }


  // Guardar nuevo transportista
  saveTransportista(formData: any) {
    const fd = new FormData();

    fd.append('nombre_completo', formData.nombre_completo);
    fd.append('documento_identificacion', formData.documento_identificacion);

    // Archivos
    if (this.selectedFiles.licencia) {
      fd.append('licencia_conducir', this.selectedFiles.licencia);
    }

    if (this.selectedFiles.carnet) {
      fd.append('carnet_cargas_peligrosas', this.selectedFiles.carnet);
    }

    if (this.selectedFiles.poliza) {
      fd.append('poliza_seguro_accidentes_personales_art', this.selectedFiles.poliza);
    }

    this.transportistaService.createTransportista(fd).subscribe({
      next: (res) => {
        const nuevo = res.data;
        this.transportistas.push(nuevo);
        this.syncDriversToJS();
        this.closeModal('driver');
      },
      error: (err) => {
        console.error('❌ Error guardando transportista:', err);
      }
    });
  }

  // Guardar nuevo transporte
  saveTransporte(formData: any) {
    const fd = new FormData();
    console.log(formData);
    fd.append('acoplado', formData.acoplado);
    fd.append('marca', formData.marca);
    fd.append('modelo', formData.modelo);
    fd.append('patente', formData.patente);

    // Archivos
    if (this.selectedFiles.titulo) {
      fd.append('titulo', this.selectedFiles.titulo);
    }

    if (this.selectedFiles.rtv) {
      fd.append('rtv', this.selectedFiles.rtv);
    }

    if (this.selectedFiles.poliza_seguro) {
      fd.append('poliza_seguro', this.selectedFiles.poliza_seguro);
    }

    this.transporteService.createTransporte(fd).subscribe({
      next: (res) => {
        const nuevo = res.data;
        this.transportes.push(nuevo);
        this.closeModal('vehicle');
        this.syncTransportsToJS();
      },
      error: (err) => {
        console.error('❌ Error guardando transporte:', err);
      }
    });
  }

  
  // Guardar nuevo transporte
  saveRecorrido(formData: any) {
    const fd = new FormData();
    console.log(formData);

    // fd.append('inicio', formData.);
    // fd.append('marca', formData.marca);
    // fd.append('modelo', formData.modelo);
    // fd.append('patente', formData.patente);
    
    this.syncRecorridosToJS(formData);
    this.closeModal('recorrido');
  //   // Archivos
  //   if (this.selectedFiles.titulo) {
  //     fd.append('titulo', this.selectedFiles.titulo);
  //   }

  //   if (this.selectedFiles.rtv) {
  //     fd.append('rtv', this.selectedFiles.rtv);
  //   }

  //   if (this.selectedFiles.poliza_seguro) {
  //     fd.append('poliza_seguro', this.selectedFiles.poliza_seguro);
  //   }

  //   this.transporteService.createTransporte(fd).subscribe({
  //     next: (res) => {
  //       const nuevo = res.data;
  //       this.transportes.push(nuevo);
  //       this.syncTransportsToJS();
  //     },
  //     error: (err) => {
  //       console.error('❌ Error guardando transporte:', err);
  //     }
  //   });
  }

  closeModal(modal: string) {
    app.closeModal(modal); // si querés seguir usando el JS
  }

}

