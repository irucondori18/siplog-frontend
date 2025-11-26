import { Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../data-access/proveedor.service';
import { Proveedor } from '../../data-access/proveedor.model';
import { CommonModule } from '@angular/common'; // <-- Importa esto

@Component({
  selector: 'app-proveedor-list',
  standalone: true, // <-- Si es un componente standalone
  imports: [CommonModule], //aqui tambien se agrego
  templateUrl: './proveedor-list.component.html',
  styleUrl: './proveedor-list.component.scss'
})
export class ProveedorListComponent implements OnInit{
  //lista de provedores
  listaProveedores: Proveedor[] = [];

  constructor(private proveedorService: ProveedorService) { }

  ngOnInit(): void {
    this.cargarProveedores2();
  }

  cargarProveedores2(): void {
    this.proveedorService.getProveedores().subscribe(response => {
      console.log(response);
      this.listaProveedores=response as Proveedor[];
    });
  }
}

//  cargarProveedores(): void {
//    this.proveedorService.getProveedores().subscribe({
//      next: (data) => {
//        this.proveedores = data;
//        console.log('Proveedores cargados:', this.proveedores);
//asignarlo a una tabla, create camioneros, un alta de transportistas, de transporte
//cambiando
//      },
//      error: (err) => {
//        console.error('Error al cargar proveedores', err);
//      },
//    });
//  }
//}
