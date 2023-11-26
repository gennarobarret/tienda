import { Component, OnInit } from '@angular/core';
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(
    private _adminService: AdminService,
    private _router: Router
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    this._adminService.logout();
    this._router.navigate(['/login']);
    // Aquí puedes redirigir a la página de inicio o a donde desees luego del cierre de sesión
  }
}
