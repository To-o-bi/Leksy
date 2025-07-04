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
curl --location --request POST '{base_url}/api/admin/add-product?name={name}&price={price|numeric}&slashed_price={slashed_price|numeric}&description={description}&quantity={quantity|integer}&category={category}&images={files|max:2mb_each|image/*}' \
--header 'Authorization: Bearer {token}'
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
curl --location --request POST '{base_url}/api/admin/update-product?product_id={product_id}name={name|optional}&price={price|numeric|optional}&slashed_price={slashed_price|numeric|optional}&description={description|optional}&quantity={quantity|integer|optional}&category={category|optional}&concern_options={concern_options_1,concern_options_2,concern_options_n}&images={files|max:2mb_each|image/*|optional}' \
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

- [GET] sort = {name|price|category} // can sort by column names, i.e; sort='price', to sort by price (always ASC)
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

## Update Delivery Fees

```CURL
curl --location --request POST '{base_url}/api/admin/update-delivery-fees?Edo={2999}&Kogi={3100}&Cross River={5030}&Akwa Ibom={1100}&State={price}' \
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


## Fetch Delivery Fee for a Single State

```CURL
curl --location --request GET '{base_url}/api/fetch-delivery-fee?state={State}'
```

```JSON
{
	"code": 200,
	"message": "Delivery fee fetched!",
	"delivery_fee": 3999
}
```


## Fetch All Delivery Fees

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



# ORDERS

## Placing Order

There are two key steps:

### 1. Initiate Checkout (This will alert and prepare the payment gateway for the next step)

```CURL
curl --location --request POST '{base_url}/api/checkout/initiate?name={name}&email={email}&phone={phone}&delivery_method={pickup/address}&state={state|optional}&city={city|optional}&street_address={street_address|optional}&cart={a_valid_json_encoded_cart_object|see_sample_below}&success_redirect={https://leksycosmetics.com/path/to/your-successful-order-page}'
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
curl --location --request GET '{base_url}/api/fetch-consultations?&payment_status={payment_status|default:successful|optional}&session_held_status={session_held_status|default:all:except:unpaid|optional}&limit={limit|integer|optional}' \
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
	]
}
```



