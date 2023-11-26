import { Component, AfterViewInit } from '@angular/core';
import { AdminService } from "src/app/services/admin.service";
import { Router } from "@angular/router";

declare const feather: any;
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements AfterViewInit {

  constructor(
    private _adminService: AdminService,
    private _router: Router
  ) { }

  ngAfterViewInit(): void {
    feather.replace({ 'aria-hidden': 'true' });

  }

  logout(): void {
    this._adminService.logout();
    this._router.navigate(['/login']);
    // Aquí puedes redirigir a la página de inicio o a donde desees luego del cierre de sesión
  }
}
