import { Component } from '@angular/core';
import { ProveedorService } from '../../data-access/proveedor.service';
import { Proveedor } from '../../data-access/proveedor.model';

@Component({
  selector: 'app-proveedor-list',
  imports: [],
  templateUrl: './proveedor-list.component.html',
  styleUrl: './proveedor-list.component.scss'
})
export class ProveedorListComponent {

  proveedores: Proveedor[] = [];

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        console.log('Proveedores cargados:', this.proveedores);
        //asignarlo a una tabla, create camioneros, un alta de transportistas, de transporte
        //cambiando
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
      },
    });
  }
}
