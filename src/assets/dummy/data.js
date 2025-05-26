import serum from '/serum.png' 

export const categories = [
    { 
        id: 1,
        name: 'Serums', 
        image: serum, // Keep this as is since it's imported directly
        path: '/shop/serums', 
        bgColor: 'bg-pink-100', 
        hoverColor: 'hover:bg-pink-200',
        productCount: 24
    },
    {   
        id: 2,
        name: 'Moisturizers', 
        image: '/assets/images/categories/moisturizer.png', 
        path: '/shop/moisturizers', 
        bgColor: 'bg-amber-50', 
        hoverColor: 'hover:bg-amber-100',
        productCount: 18
    },
    { 
        id: 3,
        name: 'Bathe and body', 
        image: '/assets/images/categories/body.png', 
        path: '/shop/balms-soaps', 
        bgColor: 'bg-green-50', 
        hoverColor: 'hover:bg-green-100',
        productCount: 32
    },
    {             
        id: 4,
        name: 'Sunscreens', 
        image: '/assets/images/categories/sunscreen.png', 
        path: '/shop/sunscreens', 
        bgColor: 'bg-purple-100', 
        hoverColor: 'hover:bg-purple-200',
        productCount: 12
    },
    { 
        id: 5,
        name: 'Toners', 
        image: '/assets/images/categories/toner.png', 
        path: '/shop/toners', 
        bgColor: 'bg-blue-100', 
        hoverColor: 'hover:bg-blue-200',
        productCount: 15
    },
    { 
        id: 6,
        name: 'Face cleansers', 
        image: '/assets/images/categories/cleanser.png', 
        path: '/shop/cleansers', 
        bgColor: 'bg-emerald-100', 
        hoverColor: 'hover:bg-emerald-200',
        productCount: 21
    },
];

export const getNewArrivals = () => [
    {
        id: 1,
        name: 'Hydrating Facial Serum',
        description: 'Hyaluronic Acid & Vitamin B5',
        price: 85000,
        currency: '₦',
        image: '/assets/images/products/new-1.jpg',
        rating: 5,
        reviewCount: 32,
        isNew: true,
    },
    {
        id: 2,
        name: 'Vitamin C Brightening Moisturizer',
        description: '15% Stabilized Vitamin C Formula',
        price: 65000,
        currency: '₦',
        image: '/assets/images/products/new-2.jpg',
        rating: 4.7,
        reviewCount: 18,
        isNew: true,
    },
    {
        id: 3,
        name: 'Retinol Night Renewal Cream',
        description: 'Advanced Anti-Aging Formula',
        price: 45000,
        currency: '₦',
        image: '/assets/images/products/new-3.jpg',
        rating: 4.9,
        reviewCount: 24,
        isNew: true,
    },
    {
        id: 4,
        name: 'Rose Clay Purifying Mask',
        description: 'Pore-Refining Treatment',
        price: 45000,
        currency: '₦',
        image: '/assets/images/products/new-4.jpg',
        rating: 4.8,
        reviewCount: 15,
        isNew: true,
    },
];

export const BestSellers = () => [
    {
        id: 1,
        name: 'Botanical Cleansing Balm',
        description: 'Deep Cleansing & Makeup Removal',
        price: 45000,
        currency: '₦',
        image: '/assets/images/products/product-3.jpg',
    },
    {
        id: 2,
        name: 'Long-Lasting Liquid Foundation',
        description: 'Medium to Full Coverage Formula',
        price: 85000,
        currency: '₦',
        image: '/assets/images/products/product-1.jpg',
    },
    {
        id: 3,
        name: 'Oil Control Mattifying Primer',
        description: 'Pore-Minimizing & Oil-Free',
        price: 65000,
        currency: '₦',
        image: '/assets/images/products/product-2.jpg',
    },
    {
        id: 4,
        name: 'Volumizing Mascara',
        description: 'Intense Black Lengthening Formula',
        price: 65000,
        currency: '₦',
        image: '/assets/images/products/product-4.jpg',
    },
    {
        id: 5,
        name: 'Hyaluronic Serum Plus',
        description: 'Multi-Molecular Hydration Complex',
        price: 65000,
        currency: '₦',
        image: '/assets/images/products/product-5.jpg',
    },
    {
        id: 6,
        name: 'Long-Lasting Liquid Foundation',
        description: 'Medium to Full Coverage Formula',
        price: 85000,
        currency: '₦',
        image: '/assets/images/products/product-1.jpg',
    },
];