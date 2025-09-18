import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../../api/services';
import ProductDetail from '../../components/product/ProductDetail';
import RelatedProducts from '../../components/product/RelatedProducts';
import Loader from '../../components/common/Loader';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getCategoryDisplayName } from '../../utils/api';
import Meta from '../../components/common/Meta';
import { useRouteTransition } from '../../routes/RouteTransitionLoader';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(location.state?.product || null);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [componentReady, setComponentReady] = useState(false);
    const { endTransition } = useRouteTransition();

    useEffect(() => {
        const fetchProductDetails = async () => {
            // If we have product data from navigation state, use it and skip API call
            if (location.state?.product) {
                setProduct(location.state.product);
                setLoading(false);
                setComponentReady(true);
                
                // Still fetch related products
                try {
                    const category = location.state.product.category || location.state.product.category_name;
                    if (category && category !== 'Uncategorized') {
                        const relatedData = await productService.fetchProducts({
                            categories: [category],
                            limit: 5
                        });
                        
                        if (relatedData.products) {
                            const related = relatedData.products
                                .filter(p => {
                                    const pId = p.id || p._id || p.product_id;
                                    return pId && pId !== productId;
                                })
                                .slice(0, 4);
                                
                            setRelatedProducts(related);
                        }
                    }
                } catch (relatedErr) {
                    console.error("Error fetching related products:", relatedErr);
                    setRelatedProducts([]);
                }
                return;
            }

            // Otherwise fetch from API
            if (!productId) {
                setError("Product ID is missing");
                setLoading(false);
                endTransition(); // End loading overlay on error
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const apiResponse = await productService.fetchProduct(productId);
                
                if (!apiResponse || !apiResponse.product) {
                    setError("Product not found");
                    setLoading(false);
                    endTransition(); // End loading overlay on error
                    return;
                }

                const productData = apiResponse.product;
                setProduct(productData);
                setComponentReady(true);
                
                // Fetch related products based on the product's category
                try {
                    const category = productData.category || productData.category_name;
                    if (category && category !== 'Uncategorized') {
                        const relatedData = await productService.fetchProducts({
                            categories: [category],
                            limit: 5
                        });
                        
                        if (relatedData.products) {
                            const related = relatedData.products
                                .filter(p => {
                                    const pId = p.id || p._id || p.product_id;
                                    return pId && pId !== productId;
                                })
                                .slice(0, 4);
                                
                            setRelatedProducts(related);
                        }
                    }
                } catch (relatedErr) {
                    console.error("Error fetching related products:", relatedErr);
                    setRelatedProducts([]);
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError(`Failed to load product details: ${err.message}`);
                endTransition(); // End loading overlay on error
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId, location.state, navigate, endTransition]);

    // Handle component readiness and end transition when everything is loaded
    useEffect(() => {
        if (product && !loading && componentReady) {
            // Wait for DOM to render and images to start loading
            const timer = setTimeout(() => {
                // Check if main product image exists and wait for it to load
                if (product.images && product.images.length > 0) {
                    const mainImage = new Image();
                    mainImage.onload = () => {
                        endTransition(); // End loading overlay when main image is ready
                    };
                    mainImage.onerror = () => {
                        endTransition(); // End even if image fails to load
                    };
                    mainImage.src = product.images[0]?.url || product.images[0];
                } else {
                    endTransition(); // End if no images
                }
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [product, loading, componentReady, endTransition]);

    // Don't show the old loading screen - let the transition overlay handle it
    if (loading && !product) {
        return null; // Let the route transition overlay show instead
    }

    if (error) {
        return (
            <>
                <Meta title="Product Not Found - Leksy Cosmetics" description="The product you are looking for does not exist or is unavailable." />
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
            </>
        );
    }

    if (!product) {
        return null; // Let the transition overlay handle loading
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
        <>
            {/* DYNAMIC META TAGS FOR THE PRODUCT */}
            <Meta 
                title={`${product.name} - Leksy Cosmetics`}
                description={product.description?.substring(0, 155) || `Discover ${product.name}, a premium product from Leksy Cosmetics.`}
                keywords={`buy ${product.name}, ${product.category}, leksy cosmetics, skincare`}
                image={product.images && product.images[0]?.url}
                url={`/product/${productId}`}
            />

            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-4 sm:py-6">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                
                <div className="container mx-auto px-4 pb-8">
                    <ProductDetail product={product} loading={loading} />
                </div>
                
                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <RelatedProducts products={relatedProducts} />
                )}
            </div>
        </>
    );
};

export default ProductDetailPage;