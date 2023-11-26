import { Component, OnInit } from '@angular/core';
import { AdminService } from "src/app/services/admin.service";// Reemplaza 'ruta-al-servicio' con la ruta correcta

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
  }

  logout(): void {
    this.adminService.logout();
    // Aquí puedes redirigir a la página de inicio o a donde desees luego del cierre de sesión
  }
}
