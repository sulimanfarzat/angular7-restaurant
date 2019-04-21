import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DishService } from '../services/dish.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Dish } from '../shared/dish';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CommentFeedback } from '../shared/commentFeedback';
// import { DishDetail } from '../shared/dishDetail';
import { visibility, flyInOut, expand } from '../animations/app.animation';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [visibility(), flyInOut(), expand() ]
})
export class DishdetailComponent implements OnInit {

  // dishcomm: any = DISH;
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  dishhErrMess: string;
  errMess: string;
  dishcopy: Dish;

  visibility = 'shown';

  commentForm: FormGroup;
  commentFeedback: CommentFeedback;

  date2 = new Date();

  formErrors = {
    'author': '',
    'comment': '',
    'rating': ''
  };

  validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.',
      'maxlength':     'Author Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'comment is required.',
      'minlength':     'comment must be at least 2 characters long.',
      'maxlength':     'comment cannot be more than 25 characters long.'
    },
    'rating': {
      'required':      'rating is required.',
      'pattern':       'rating must contain only numbers.'
    }
  };

  @ViewChild('cform') feedbackFormDirective;
  @ViewChild('ratingSlider') ratSlider;

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL
    ) {
      this.createForm();
    }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
    .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
    errmess => this.dishhErrMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }




  createForm(): void {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: 5,
      comment: ['', [Validators.required] ],
      date: ''
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.commentFeedback = {
      author: this.commentForm.value.author,
      rating: this.commentForm.value.rating,
      comment: this.commentForm.value.comment,
      date: this.date2.toISOString()
    };

    this.dishcopy.comments.push(this.commentFeedback);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

    // this.commentForm.value;
    // DISH.comments.push(this.commentFeedback);
    this.feedbackFormDirective.resetForm();
    this.commentForm.reset({
      author: '',
      rating: '',
      comment: '',
      date: ''
    });
    this.ratSlider.value = 5;
  }


}
