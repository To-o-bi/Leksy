import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import ProductDetail from '../../components/product/ProductDetail';
import RelatedProducts from '../../components/product/RelatedProducts';
import Loader from '../../components/common/Loader';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getCategoryDisplayName } from '../../utils/api';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) {
                setError("Product ID is missing");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const apiResponse = await productService.fetchProduct(productId);
                
                if (!apiResponse || !apiResponse.product) {
                    setError("Product not found");
                    setLoading(false);
                    return;
                }

                const productData = apiResponse.product;
                setProduct(productData);
                
                // Fetch related products based on the product's category
                try {
                    const category = productData.category || productData.category_name;
                    if (category && category !== 'Uncategorized') {
                        const relatedData = await productService.fetchProducts({
                            categories: [category],
                            limit: 5 // Fetch one extra to filter out the current product
                        });
                        
                        if (relatedData.products) {
                            const related = relatedData.products
                                // Ensure the current product is not in the related list
                                .filter(p => {
                                    const pId = p.id || p._id || p.product_id;
                                    return pId && pId !== productId;
                                })
                                // Limit to 4 related products
                                .slice(0, 4);
                                
                            setRelatedProducts(related);
                        }
                    }
                } catch (relatedErr) {
                    console.error("Error fetching related products:", relatedErr);
                    setRelatedProducts([]); // Reset on error
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(`Failed to load product details: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
        window.scrollTo(0, 0); // Scroll to top on new product load
    }, [productId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
                <p className="mt-2 text-gray-600">Sorry, we couldn't find the product you're looking for.</p>
                <button 
                    className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                    onClick={() => navigate('/shop')}
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    const categoryName = product?.category || product?.category_name;
    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shop' },
        ...(categoryName && categoryName !== 'Uncategorized' ? [{
            label: getCategoryDisplayName(categoryName),
            path: `/shop?category=${encodeURIComponent(categoryName)}`
        }] : []),
        { label: product.name, path: `/product/${productId}` }
    ];

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-4 sm:py-6">
                <Breadcrumb items={breadcrumbItems} />
            </div>
            
            <div className="container mx-auto px-4 pb-8">
                {product && <ProductDetail product={product} />}
            </div>
            
            {/* The RelatedProducts component is now linked and will display here */}
            {relatedProducts.length > 0 && (
                <RelatedProducts products={relatedProducts} />
            )}
        </div>
    );
};

export default ProductDetailPage;
