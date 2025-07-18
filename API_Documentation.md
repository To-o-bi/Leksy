___________________________________________

***base_url = https://leksycosmetics.com***
___________________________________________


# ADMIN ACTIONS

## Login as Admin

```CURL
curl --location --request POST '{base_url}/api/admin/login?username={username}&password={password}'
```

```JSON
{
	"code": 200,
	"message": "Successful!",
	"user": {
		"name": "Leksy",
		"email": "admin@leksy.com.ng",
		"role": "superadmin",
		"username": "leksy"
	},
	"token": "{token}"
}
```


## Logout

```CURL
curl --location --request POST '{base_url}/api/admin/logout' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Token destroyed successfully!",
}
```


## Add Product

```CURL
curl --location --request POST '{base_url}/api/admin/add-product?name={name}&price={price|numeric}&slashed_price={slashed_price|numeric}&deal_end_date={valid_datetime_format|optional}&deal_price={deal_price|numeric|optional}&description={description}&quantity={quantity|integer}&concern_options={concern_options_1,concern_options_2,concern_options_n}&category={category}&images={files|max:2mb_each|image/*}' \
--header 'Authorization: Bearer {token}'
```

```
[POST] valid_datetime_format = {YYYY-MM-DD H:i:s} (e.g; "2025-11-25 22:10:55")
```

```JSON
{
	"code": 200,
	"message": "Product added successfully!",
	"product_id": "3efe23e524",
	"token": "{token}"
}
```


## Update Product

```CURL
curl --location --request POST '{base_url}/api/admin/update-product?product_id={product_id}name={name|optional}&price={price|numeric|optional}&slashed_price={slashed_price|numeric|optional}&deal_end_date={YYYY-MM-DD H:i:s|optional}&deal_price={deal_price|numeric|optional}&description={description|optional}&available_qty={available_qty|integer|optional}&category={category|optional}&concern_options={concern_options_1,concern_options_2,concern_options_n}&images={files|max:2mb_each|image/*|optional}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Product updated successfully!",
	"product_id": "3efe23e524",
	"token": "{token}"
}
```


## Delete Product

```CURL
curl --location --request POST '{base_url}/api/admin/delete-product?product_id={product_id}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Product deleted successfully!",
	"token": "{token}"
}
```



# FETCHING PRODUCT(S)

## Fetch A Single Product

```CURL
curl --location --request GET '{base_url}/api/fetch-product?product_id={product_id}'
```

```JSON
{
	"code": 200,
	"message": "Product fetch returned 1 results.",
	"product": {
		"product_id": "3efe23e524",
		"name": "Product Name",
		"price": 2999,
		"slashed_price": 3999,
		"deal_end_date": "2025-11-25 22:10:55",
		"description": "Something something",
		"available_qty": 12,
		"images": ["image_1", "image_2", "image_3"],
		"category": "moisturizers",
		"concern_options": ["rashes", "acne", "scars"]
	}
}
```


## Fetch All Products (Can also filter by category, or sort by special sorting. Can also fetch exactly by given products ids)

```CURL
curl --location --request GET '{base_url}/api/fetch-products?filter={valid_category_1,valid_category_2,valid_category_n|optional}&concern_options_filter={concern_option_1,concern_option_2,concern_option_n|optional}&products_ids_array={product_id_1,product_id_2,product_id_n|optional}&sort={special_sorting|optional}&limit={limit|integer|optional}'
```

```
Can take (optionally):

- [GET] products_ids_array = {product_id_1,product_id_2,product_id_n} // for returning exactly as much specific products as you are interested in (imagine the products in the customer's cart)

- [GET] filter = {serums|moisturizers|bathe and body|sunscreens|toners|face cleansers} // for filtering out the categories of products you are interested in. E.g; ?filter=serum will return every products under serum. (To apply multiple filters, just use comma. E.g; ?filter=serums,bathe and body,sunscreens)

- [GET] sort = {name|price|category} // can sort by column names, i.e; sort='price', to sort by price (Always ASC)
```

```JSON
{
	"code": 200,
	"message": "Products fetch returned 2 results.",
	"products": [
		{
			"product_id": "3efe23e524",
			"name": "Product Name",
			"price": 2999,
			"slashed_price": 3999,
			"deal_end_date": "2025-11-25 22:10:55",
			"description": "Something something",
			"available_qty": 12,
			"images": ["image_1", "image_2", "image_3"],
			"category": "moisturizers",
			"concern_options": ["rashes", "acne", "scars"]
		},
		{
			"product_id": "5432e42f",
			"name": "Product Name",
			"price": 12000,
			"slashed_price": 15000,
			"deal_end_date": "2025-11-25 22:10:55",
			"description": "Something something",
			"available_qty": 5,
			"images": ["image_1", "image_2", "image_3"],
			"category": "face cleansers",
			"concern_options": ["rashes", "acne", "scars"]
		}
	]
}
```



# DELIVERY FEES

## Update Delivery Fees - Rapid Mode (States Level)

```CURL
curl --location --request POST '{base_url}/api/admin/update-delivery-fees?Edo={2999}&Kogi={3100}&Cross River={5030}&Akwa Ibom={1100}&State={fee|numeric}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Delivery fees updated successfully!",
	"delivery_fees": [
		{
			"state": "Abia",
			"delivery_fee": 2999
		},
		...
	],
	"token": "{token}"
}
```


## Fetch Delivery Fee for a Single State/LGA

```CURL
curl --location --request GET '{base_url}/api/fetch-delivery-fee?state={State|optional:when(isset(lga))}&lga={Lga|optional:when(isset(state))}'
```

```JSON
{
	"code": 200,
	"message": "Delivery fee fetched for Alimosho!",
	"delivery_fee": 3999
}
```


## Fetch All Delivery Fees (States Based)

```CURL
curl --location --request GET '{base_url}/api/fetch-delivery-fees'
```

```JSON
{
	"code": 200,
	"message": "Delivery fees fetch returned 37 results.",
	"delivery_fees": [
		{
			"state": "Abia",
			"delivery_fee": 2999
		},
		...
	]
}
```


## Fetch All Delivery Fees (LGAs Based)

```CURL
curl --location --request GET '{base_url}/api/fetch-lgas-delivery-fees?state={State|optional}'
```

```JSON
{
	"code": 200,
	"message": "Delivery fees fetch returned 41 results.",
	"delivery_fees": [
		{
			"state": "Lagos",
			"lga": "Epe",
			"delivery_fee": 2999
		},
		...
	]
}
```


## Fetch Bus Park Delivery Fee

```CURL
curl --location --request GET '{base_url}/api/fetch-bus-park-delivery-fee'
```

```JSON
{
	"code": 200,
	"message": "Delivery fee fetched for Lagos Parks!",
	"delivery_fee": 2000
}
```


## Update Bus Park Delivery Fee

```CURL
curl --location --request POST '{base_url}/api/admin/bus-park-delivery-fee/update?delivery_fee={fee|numeric}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Bus park delivery fee updated to 2000 successfully!",
	"token": "{token}"
}
```


## Update Delivery Fees - Rapid Mode (LGAs level)

```CURL
curl --location --request POST '{base_url}/api/admin/lgas-delivery-fees/update?Agege={2999}&Ika Ibom={3100}&Lga={fee|numeric}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Delivery fees updated successfully!",
	"delivery_fees": [
		{
			"state": "Lagos",
			"lga": "Agege",
			"delivery_fee": 2999
		},
		...
	],
	"token": "{token}"
}
```


## Add A LGA Delivery Fee

```CURL
curl --location --request POST '{base_url}/api/admin/lgas-delivery-fees/add?state={State}&lga={Lga}&delivery_fee={fee|numeric}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "LGA delivery fee added successfully!",
	"delivery_fees": {
		"state": "Lagos",
		"lga": "Eti Osa",
		"delivery_fee": 4000
	},
	"token": "{token}"
}
```


## Remove A LGA Delivery Fee

- Feel Free: Any checkout to a non-existent LGA will fallback to charge the user the delivery fee to the state. So deleting an LGA will simply fallback to charge the user delivery fee for the state, so the users do not go scotfree of delivery fee.

```CURL
curl --location --request POST '{base_url}/api/admin/lgas-delivery-fees/remove?state={State}&lga={Lga}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "The given LGA of the given State (if exists) has been deleted successfully!",
	"token": "{token}"
}
```



# ORDERS

## Placing Order

There are two key steps:

### 1. Initiate Checkout (This will alert and prepare the payment gateway for the next step)

```CURL
curl --location --request POST '{base_url}/api/checkout/initiate?name={name}&email={email}&phone={phone}&delivery_method={pickup/address/bus-park}&state={state|optional}&lga={lga|optional|required:if(state=lagos)}&city={city|optional}&street_address={street_address|optional}&cart={a_valid_json_encoded_cart_object|see_sample_below}&success_redirect={https://leksycosmetics.com/path/to/your-successful-order-page}'
```

```
Sample valid cart structure:

cart = [
			{
				"product_id": "product_id",
				"quantity": 4
			},
			{
				"product_id": "product_id",
				"quantity": 3
			},
			...
		]
```

```JSON
{
   "code": 200,
   "message": "Success! Please proceed to payment.",
   "amount_calculated": 15000,
   "access_code": "0749hp9w6ouli2t",
   "authorization_url": "https://checkout.paystack.com/0749hp9w6ouli2t"
}
```

### 2. Redirect the user to the authorization_url

```CURL
curl --location --request GET {authorization_url}
```

```
You don't need to anything after redirecting the user to the above {authorization_url}. The rest will sort itself, and the url will perform the rest of the redirection.
```


## What to Expect on `path/to/your-successful-order-page`

` [GET] path/to/your-successful-order-page?message=Order+concluded+successfully!&order_id=pkg-3efe23e524`

```JSON
{
   "message": "Order concluded successfully!",
   "order_id": "pkg-3efe23e524"
}
```

```
Then you can use the order_id to fetch whatever details you want to show the customer about the order.
```


## Fetch a Single Order

```CURL
curl --location --request GET '{base_url}/api/fetch-order?order_id={order_id}'
```

```JSON
{
	"code": 200,
	"message": "Order fetch returned 1 results.",
	"product": {
		"order_id": "pkg-3efe23e524",
		"order_status": "successful|failed|flagged",
		"delivery_status": "order received",
		"email": "john@doe.com",
		"name": "John Doe",
		"phone": "07012312131",
		"delivery_method": "address|pickup",
		"state": "Kogi",
		"lga": null,
		"city": "Lokoja",
		"street address": "1, My Street",
		"amount_calculated": 25000, // Must be exactly equal to amount_paid, else a fraud has happened. 
		"amount_paid": 25000,
		"cart_obj": [
			{
				"product_id": "product_id",
				"product_name": "Product Name",
				"product_image": "image.jpg",
				"product_price": 5500,
				"ordered_quantity": 4
			},
			{
				"product_id": "product_id",
				"product_name": "Product Name",
				"product_image": "image.jpg",
				"product_price": 1000,
				"ordered_quantity": 3
			}
		],
		"created_at": "2025-05-29 23:26:18"
	}
}
```


## Fetch All Orders

```CURL
curl --location --request GET '{base_url}/api/fetch-orders?&order_status={order_status|default:successful|optional}&delivery_status={delivery_status|default:all:except:unpaid|optional}&limit={limit|integer|optional}' \
--header 'Authorization: Bearer {token}'
```

```
- [GET] order_status = {successful|unsuccessful|all} // Order status just means status of payment.
- [GET] delivery_status = {unpaid|order-received|packaged|in-transit|delivered|all}
```

```JSON
{
	"code": 200,
	"message": "Orders fetch returned 2 results.",
	"products": [
		{
			"order_id": "pkg-3efe23e524",
			"order_status": "successful|failed|flagged",
			"delivery_status": "order received",
			"email": "john@doe.com",
			"name": "John Doe",
			"phone": "07012312131",
			"delivery_method": "address|pickup",
			"state": "Kogi",
			"lga": null,
			"city": "Lokoja",
			"street address": "1, My Street",
			"amount_calculated": 25000, // Must be exactly equal to amount_paid, else a fraud has happened. 
			"amount_paid": 25000,
			"cart_obj": [
				{
					"product_id": "product_id",
					"product_name": "Product Name",
					"product_image": "image.jpg",
					"product_price": 5500,
					"ordered_quantity": 4
				},
				{
					"product_id": "product_id",
					"product_name": "Product Name",
					"product_image": "image.jpg",
					"product_price": 1000,
					"ordered_quantity": 3
				}
			],
			"created_at": "2025-05-29 23:26:18"
		},
		...
	],
	"token": "6845cbf15a504"
}
```


## Change Delivery Status

```CURL
curl --location --request POST '{base_url}/api/admin/change-delivery-status?new_delivery_status={new_delivery_status}'\
--header 'Authorization: Bearer {token}'
```

```
[POST] new_delivery_status = {unpaid|order-received|packaged|in-transit|delivered}
```

```JSON
{
	"code": 200,
	"message": "Status changed to {new_delivery_status} successfully! The customer has been mailed successfully!",
}
```



# CONTACT SUBMISSIONS

## Submit Contact Form

```CURL
curl --location --request POST '{base_url}/api/submit-contact?name={name}&email={email}&phone={phone}&subject={subject}&message={message}'
```

```JSON
{
	"code": 200,
	"message": "Successful!",
	"submission_id": 8
}
```


## Fetch a Single Contact Submission

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-contact-submission?submission_id={submission_id}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Contact submission fetch returned 1 results.",
	"submission": {
		"name": "John Doe",
		"email": "john@doe.com",
		"phone": "09111292921",
		"subject": "Something",
		"message": "Stuff",
		"created_at": "2002-08-05"
	}
}
```


## Fetch All Contact Submissions

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-contact-submissions?limit={limit|integer|optional}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Contact submissions fetch returned 2 results.",
	"submission": [
		{
			"name": "John Doe",
			"email": "john@doe.com",
			"phone": "09111292921",
			"subject": "Something",
			"message": "Stuff",
			"created_at": "2002-08-05"
		},
		...
	]
}
```



# CONSULTATION

## Booking Consultation

There are two key steps:

### 1. Initiate Consultation (This will alert and prepare the payment gateway for the next step)

```CURL
curl --location --request POST '{base_url}/api/consultation/initiate?name={name}&email={email}&phone={phone}&age_range={age_range}&gender={gender}&skin_type={skin_type}&skin_concerns={skin_concern_1,skin_concern_2,skin_concern_n}&current_skincare_products={current_skincare_products|optional}&additional_details={additional_details|optional}&channel={a_valid_channel}&date={yyyy-mm-dd}&time_range={a_valid_time_range}&success_redirect={https://leksycosmetics.com/path/to/your-successful-consultation-page}'
```

```
[POST] a_valid_channel = {video-channel|whatsapp}
[POST] a_valid_time_range = {2:00 PM - 3:00 PM|3:00 PM - 4:00 PM|4:00 PM - 5:00 PM|5:00 PM - 6:00 PM}

E.g; consultation/initiate?name=Jane Doe&date=2002-01-30&time_range=3:00 PM - 4:00 PM&channel=whatsapp
```

```JSON
{
   "code": 200,
   "message": "Success! Please proceed to payment.",
   "amount_calculated": 15000,
   "access_code": "0749hp9w6ouli2t",
   "authorization_url": "https://checkout.paystack.com/0749hp9w6ouli2t"
}
```

### 2. Redirect the user to the authorization_url

```CURL
curl --location --request GET {authorization_url}
```

```
You don't need to anything after redirecting the user to the above {authorization_url}. The rest will sort itself, and the url will perform the rest of the redirection.
```


## What to Expect on `path/to/your-successful-consultation-page`

` [GET] path/to/your-successful-consultation-page?message=Consulatation+booked+successfully!&order_id=pkg-3efe23e524`

```JSON
{
   "message": "Consultation booked successfully!",
   "consultation_id": "bk-3efe23e524"
}
```

```
Then you can use the consultation_id to fetch whatever details you want to show the customer about the consultation.
```


## Fetch Booked Times (Different from Fetch Consultations)

```CURL
curl --location --request GET '{base_url}/api/consultation/fetch-booked-times?date={yyyy-mm-dd|optional}'
```

```JSON
{
	"code": 200,
	"message": "Fetch booked times returned 1 results",
	"booked_times": [
		{
			"date": "2002-01-30",
			"time_range": "3:00 PM - 4:00 PM"
		},
		{
			"date": "2002-01-30",
			"time_range": "4:00 PM - 5:00 PM"
		},
		...
	]
}
```


## Fetch a Single Consultation

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-consultation?consultation_id={consultation_id}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Consultation fetch returned 1 results.",
	"consultation": {
		"id": 1,
		"unique_id": "bk-684e2bbe5140a",
		"api_ref": "11dlosa5ph",
		"payment_status": "SUCCESSFUL",
		"session_held_status": "unheld",
		"name": "Felicia H.",
		"email": "hendersonf52@gmail.com",
		"phone": "08011229391",
		"age_range": "20 - 25",
		"gender": "female",
		"skin_type": "normal",
		"skin_concerns": "acne",
		"current_skincare_products": "",
		"additional_details": "",
		"channel": "whatsapp",
		"date": "2025-06-15",
		"time_range": "2:00 PM - 3:00 PM",
		"amount_calculated": 15000,
		"amount_paid": 15000,
		"created_at": "2025-06-15 03:11:16",
		"consultation_id": "bk-684e2bbe5140a"
	},
	"token": "684f10a19a3d0"
}
```


## Fetch All Consultations

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-consultations?&payment_status={payment_status|default:successful|optional}&session_held_status={session_held_status|default:all:except:unpaid|optional}&limit={limit|integer|optional}' \
--header 'Authorization: Bearer {token}'
```

```
- [GET] payment_status = {successful|unsuccessful|all}
- [GET] session_held_status = {unpaid|unheld|in-session|completed|all}
```

```JSON
{
	"code": 200,
	"message": "Consultations fetch returned 1 coming/current consultations and 0 past consultations",
	"coming_consultations": [
		{
			"id": 1,
			"unique_id": "bk-684e2bbe5140a",
			"api_ref": "11dlosa5ph",
			"payment_status": "SUCCESSFUL",
			"session_held_status": "unheld",
			"name": "Felicia H.",
			"email": "hendersonf52@gmail.com",
			"phone": "08011229391",
			"age_range": "20 - 25",
			"gender": "female",
			"skin_type": "normal",
			"skin_concerns": "acne",
			"current_skincare_products": "",
			"additional_details": "",
			"channel": "whatsapp",
			"date": "2025-06-15",
			"time_range": "2:00 PM - 3:00 PM",
			"amount_calculated": 15000,
			"amount_paid": 15000,
			"created_at": "2025-06-15 03:11:16",
			"consultation_id": "bk-684e2bbe5140a"
		},
		...
	],
	"past_consultations": [
		{
			"id": 1,
			"unique_id": "bk-684e2bbe5140a",
			"api_ref": "11dlosa5ph",
			"payment_status": "SUCCESSFUL",
			"session_held_status": "unheld",
			"name": "Felicia H.",
			"email": "hendersonf52@gmail.com",
			"phone": "08011229391",
			"age_range": "20 - 25",
			"gender": "female",
			"skin_type": "normal",
			"skin_concerns": "acne",
			"current_skincare_products": "",
			"additional_details": "",
			"channel": "whatsapp",
			"date": "2002-01-30",
			"time_range": "2:00 PM - 3:00 PM",
			"amount_calculated": 15000,
			"amount_paid": 15000,
			"created_at": "2002-01-25 01:22:20",
			"consultation_id": "bk-574e2bfe5321b"
		},
		...
	],
	"token": "684f114f2ce4f"
}
```


## Update Consultation

```CURL
curl --location --request POST '{base_url}/api/admin/update-consultation?consultation_id={consultation_id}&session_held_status={session_held_status|optional}&name={name|optional}&email={email|optional}&phone={phone|optional}&age_range={age_range|optional}&gender={gender|optional}&skin_type={skin_type|optional}&skin_concerns={skin_concern_1,skin_concern_2,skin_concern_n|optional}&current_skincare_products={current_skincare_products|optional}&additional_details={additional_details|optional}&channel={a_valid_channel|optional}&date={yyyy-mm-dd|optional}&time_range={a_valid_time_range|optional}' \
--header 'Authorization: Bearer {token}'
```

```
[POST] session_held_status = {unpaid|unheld|in-session|completed|all}
[POST] a_valid_channel = {video-channel|whatsapp}
[POST] a_valid_time_range = {2:00 PM - 3:00 PM|3:00 PM - 4:00 PM|4:00 PM - 5:00 PM|5:00 PM - 6:00 PM}
```

```JSON
{
	"code": 200,
	"message": "Consultation updated successfully!",
	"consultation": {
		"id": 2,
		"unique_id": "bk-685e9be65b69c",
		"api_ref": "62h45vok5p",
		"payment_status": 0,
		"session_held_status": "unheld",
		"name": "Felicia H.",
		"email": "hendersonf52@gmail.com",
		"phone": "08011229391",
		"age_range": "20 - 25",
		"gender": "female",
		"skin_type": "normal",
		"skin_concerns": "acne",
		"current_skincare_products": "Olive mint cream",
		"additional_details": "I use olive mint cream",
		"channel": "whatsapp",
		"date": "2025-06-28",
		"time_range": "2:00 PM - 3:00 PM",
		"amount_calculated": 15000,
		"amount_paid": 15000,
		"created_at": "2025-06-27 14:25:59",
		"consultation_id": "bk-685e9be65b69c"
	},
	"token": "68641f6750a7c"
}
```


## Send Consultation Link

```CURL
curl --location --request POST '{base_url}/api/admin/send_consultation_link?consultation_id={consultation_id}&meet_link={meet_link}?override={true/false|default:false|optional}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
   "code": 200,
   "message": "Meeting link sent successfully!",
   "consultation":    {
      "id": 2,
      "unique_id": "bk-685e9be65b69c",
      "api_ref": "62h45vok5p",
      "payment_status": 0,
      "session_held_status": "unheld",
      "cron_trial_count": 3,
      "name": "Felicia H.",
      "email": "hendersonf52@gmail.com",
      "phone": "08011229391",
      "age_range": "20 - 25",
      "gender": "female",
      "skin_type": "normal",
      "skin_concerns": "acne",
      "current_skincare_products": "Olive mint cream",
      "additional_details": "I use olive mint cream",
      "channel": "whatsapp",
      "meet_link": "https://meet.google.com/abc",
      "date": "2025-07-05",
      "time_range": "2:00 PM - 3:00 PM",
      "amount_calculated": 15000,
      "amount_paid": 15000,
      "created_at": "2025-06-27 14:25:59"
   },
   "token": "68641f6750a7c"
}
```


## Send Reminders and Thank Yous (Optional - Already happens automatically)

```CURL
curl --location --request POST '{base_url}/api/cronjobs/consultation_complete'
```

```JSON
EMPTY response
```



# NEWSLETTER SUBSCRIBERS

## Add A Subscriber

```CURL
curl --location --request POST '{base_url}/api/newsletter-subscribers/add?email={email}'
```

```JSON
{
	"code": 200,
	"message": "Subscriber added successfully!"
}
```


## Remove A Subscriber

```CURL
curl --location --request POST '{base_url}/api/newsletter-subscribers/remove?email={email}'
```

```JSON
{
	"code": 200,
	"message": "Subscriber removed successfully!"
}
```


## Fetch All Subscribers

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-newsletter-subscribers?limit={limit|optional}' \
--header 'Authorization: Bearer {token}'
```

```JSON
{
	"code": 200,
	"message": "Newsletter subscribers fetch returned 2 results.",
	"submission": [
		{
			"email": "john@doe.com",
			"created_at": "2005-08-05"
		},
		...
	],
	"token": "68641f6750a7c"
}
```



# NOTIFICATIONS

## Fetch All Notifications

```CURL
curl --location --request GET '{base_url}/api/admin/fetch-notifications?limit={limit|integer|optional}' \
--header 'Authorization: Bearer {token}'
```


```JSON
{
	"code": 200,
	"message": "Notifications fetch returned 3 results",
	"notifications": [
		{
			"id": 4,
			"type": "consultations",
			"type_id": "bk-684e2bbe5140a",
			"title": "New Consultation Booking",
			"description": "omeone just booked a Video consultation.\nDate: 2025-08-01\nTime: 02:00 PM - 03:00 PM",
			"created_at": "2025-07-05 04:25:02"
		},
		{
			"id": 3,
			"type": "orders",
			"type_id": "pkg-686899dd0dfe7",
			"title": "New Order Received",
			"description": "Felicia placed an order worth of &amp;#8358;18,100. Full details available in the orders section.",
			"created_at": "2025-07-05 04:20:57"
		},
		{
			"id": 2,
			"type": "products",
			"type_id": "product_684d90b1e6aad",
			"title": "Low Stock Alert",
			"description": "Product: Abc is currently running low! Remaining: 5 qty.",
			"created_at": "2025-07-05 04:20:48"
		},
		{
			"id": 1,
			"type": "contact_submissions",
			"type_id": "3",
			"title": "New Contact Form Submission",
			"description": "Message: Hello testingg...",
			"created_at": "2025-07-05 04:17:49"
		}
	],
	"token": "68641f6750a7c"
}
```

