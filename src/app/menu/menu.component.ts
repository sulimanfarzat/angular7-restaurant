import { Component, OnInit, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Router } from '@angular/router';
// import { DISHES } from '../shared/dishes';

  @Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
  })


export class MenuComponent implements OnInit {


  dishes: Dish[];
  errMess: string;

  // selectedDish: Dish; // DISHES[0];

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject('BaseURL') private BaseURL: string
    ) { }

  ngOnInit() {
    this.dishService.getDishes()
    .subscribe(dishes => this.dishes = dishes,
      errmess => this.errMess = <any>errmess);
  }

  // onSelect(dish: Dish) {
  //   // this.selectedDish = dish;
  // }

}
