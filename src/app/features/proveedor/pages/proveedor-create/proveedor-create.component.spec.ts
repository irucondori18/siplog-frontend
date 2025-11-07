import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorCreateComponent } from './proveedor-create.component';

describe('ProveedorCreateComponent', () => {
  let component: ProveedorCreateComponent;
  let fixture: ComponentFixture<ProveedorCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
