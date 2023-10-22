import { Injectable } from '@estadicono_categoriaangular/core';
import { Observable } from "rxjs";
import { GLOBAL } from "./GLOBAL";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  public url;

  constructor(
    private _http: HttpClient,
  ) {
    this.url = GLOBAL.url;
  }

  registro_categoria_admin(data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Authorization': token });
    const fd = new FormData();
    fd.append('titulo_categoria', data.titulo_categoria);
    fd.append('icono_categoria', data.icono_categoria);
    fd.append('estado_categoria', data.estado_categoria);
    // fd.append('oferta', data.oferta);
    // fd.append('portada', file);
    // fd.append('descuento_oferta', data.descuento_oferta);
    // fd.append('fin_oferta', data.fin_oferta);
    return this._http.post(this.url + 'registro_categoria_admin', fd, { headers: headers });
  }

  listar_categorias_admin(filtro: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'listar_categorias_admin/' + filtro, { headers: headers });
  }

  obtener_categoria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(this.url + 'obtener_categoria_admin/' + id, { headers: headers });
  }

  actualizar_categoria_admin(data: any, id: any, token: any): Observable<any> {
    if (data.portada) {
      let headers = new HttpHeaders({ 'Authorization': token });
      const fd = new FormData();
      fd.append('titulo_categoria', data.titulo_categoria);
      fd.append('icono_categoria', data.icono_categoria);
      fd.append('estado_categoria', data.estado_categoria);
      // fd.append('oferta', data.oferta);
      // fd.append('portada', data.portada);
      // fd.append('descuento_oferta', data.descuento_oferta);
      // fd.append('fin_oferta', data.fin_oferta);

      return this._http.put(this.url + 'actualizar_categoria_admin/' + id, fd, { headers: headers });
    } else {
      let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
      return this._http.put(this.url + 'actualizar_categoria_admin/' + id, data, { headers: headers });
    }
  }

  eliminar_categoria_admin(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.delete(this.url + 'eliminar_categoria_admin/' + id, { headers: headers });
  }
}