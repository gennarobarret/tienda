import { Component } from '@angular/core';

declare const Chart: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})

export class InicioComponent {

  constructor() { }

  ngAfterViewInit(): void {
    const ctx = document.getElementById('myChart');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [
          'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        datasets: [{
          data: [
            15339, 21345, 18483, 24003, 23489, 24092, 12034
          ],
          lineTension: 0,
          backgroundColor: 'transparent',
          borderColor: '#007bff',
          borderWidth: 4,
          pointBackgroundColor: '#007bff'
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        },
        legend: {
          display: false
        }
      }
    });
  }
}

// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-inicio',
//   templateUrl: './inicio.component.html',
//   styleUrls: ['./inicio.component.css']
// })
// export class InicioComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }