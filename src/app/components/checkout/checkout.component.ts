import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { TanujazonFormService } from 'src/app/services/tanujazon-form.service';
import { TanujazonValidators } from 'src/app/validators/tanujazon-validators';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
    checkoutFormGroup!: FormGroup;

    totalPrice: number = 0;
    totalQuantity: number = 0;

    creditCardYears: number[] = [];
    creditCardMonths: number[] = [];

    countries: Country[] = [];

    shippingAddressStates: State[] = [];
    billingAddressStates: State[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private tanujazonFormService: TanujazonFormService
    ) {}

    ngOnInit(): void {
        this.checkoutFormGroup = this.formBuilder.group({
            customer: this.formBuilder.group({
                firstName: new FormControl('', [
                    Validators.required,
                    Validators.minLength(2),
                    TanujazonValidators.notOnlyWhiteSpace,
                ]),
                lastName: new FormControl('', [
                    Validators.required,
                    Validators.minLength(2),
                    TanujazonValidators.notOnlyWhiteSpace,
                ]),
                email: new FormControl('', [
                    Validators.required,
                    Validators.pattern(
                        '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
                    ),
                ]),
            }),
            shippingAddress: this.formBuilder.group({
                street: [''],
                city: [''],
                state: [''],
                country: [''],
                zipCode: [''],
            }),
            billingAddress: this.formBuilder.group({
                street: [''],
                city: [''],
                state: [''],
                country: [''],
                zipCode: [''],
            }),
            creditCard: this.formBuilder.group({
                cardType: [''],
                nameOnCard: [''],
                cardNumber: [''],
                securityCode: [''],
                expirationMonth: [''],
                expirationYear: [''],
            }),
        });

        // populate credit card months
        const startMonth: number = new Date().getMonth() + 1;
        console.log('startMonth: ' + startMonth);

        this.tanujazonFormService
            .getCreditCardMonths(startMonth)
            .subscribe((data) => {
                console.log(
                    'Retrieve credit card months: ' + JSON.stringify(data)
                );
                this.creditCardMonths = data;
            });

        // populate credit card years
        this.tanujazonFormService.getCreditCardYears().subscribe((data) => {
            console.log('Retrieved credit card years: ' + JSON.stringify(data));
            this.creditCardYears = data;
        });

        // populate countries
        this.tanujazonFormService.getCountries().subscribe((data) => {
            console.log('Retrieved countries: ' + JSON.stringify(data));
            this.countries = data;
        });
    }

    get firstName() {
        return this.checkoutFormGroup.get('customer.firstName');
    }
    get lastName() {
        return this.checkoutFormGroup.get('customer.lastName');
    }
    get email() {
        return this.checkoutFormGroup.get('customer.email');
    }

    copyShippingAddressToBillingAddress(event: any) {
        if (event.target.checked) {
            this.checkoutFormGroup.controls['billingAddress'].setValue(
                this.checkoutFormGroup.controls['shippingAddress'].value
            );

            // bug fix for states
            this.billingAddressStates = this.shippingAddressStates;
        } else {
            this.checkoutFormGroup.controls['billingAddress'].reset();

            // bug fix for states
            this.billingAddressStates = [];
        }
    }

    onSubmit() {
        console.log('Handling the submit button');

        if (this.checkoutFormGroup.invalid) {
            this.checkoutFormGroup.markAllAsTouched();
        }

        console.log(this.checkoutFormGroup?.get('customer')?.value);
        console.log(
            'The email address is ' +
                this.checkoutFormGroup?.get('customer')?.value.email
        );
        console.log(
            'The shipping address country is ' +
                this.checkoutFormGroup?.get('shippingAddress')?.value.country
                    .name
        );
        console.log(
            'The shipping address state is ' +
                this.checkoutFormGroup?.get('shippingAddress')?.value.state.name
        );
    }

    handleMonthsAndYears() {
        const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
        const currentYear: number = new Date().getFullYear();
        const selectedYear: number = Number(
            creditCardFormGroup?.value.expirationYear
        );

        // if the current year equals the selected year, then start with the current month

        let startMonth: number;

        if (currentYear === selectedYear) {
            startMonth = new Date().getMonth() + 1;
        } else {
            startMonth = 1;
        }

        this.tanujazonFormService
            .getCreditCardMonths(startMonth)
            .subscribe((data) => {
                console.log(
                    'Retrieved credit card months: ' + JSON.stringify(data)
                );
                this.creditCardMonths = data;
            });
    }

    getStates(formGroupName: string) {
        const formGroup = this.checkoutFormGroup.get(formGroupName);

        const countryCode = formGroup?.value.country.code;
        const countryName = formGroup?.value.country.name;

        console.log(`${formGroupName} country code: ${countryCode}`);
        console.log(`${formGroupName} country name: ${countryName}`);

        this.tanujazonFormService.getStates(countryCode).subscribe((data) => {
            if (formGroupName === 'shippingAddress') {
                this.shippingAddressStates = data;
            } else {
                this.billingAddressStates = data;
            }

            // select the first state as the default
            formGroup?.get('state')?.setValue(data[0]);
        });
    }
}
