import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import ProductDetail from '../../components/product/ProductDetail';
import RelatedProducts from '../../components/product/RelatedProducts';
import Breadcrumb from '../../components/common/Breadcrumb';
import Loader from '../../components/common/Loader';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { 
    getProductById, 
    filterByCategory, 
    loading, 
    error, 
    clearError 
  } = useProducts();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log("Fetching product details for ID:", productId);
      
      if (!productId) {
        setPageError("Product ID is missing");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setPageError(null);
        clearError();
        
        // Fetch the product using the context method
        const productData = await getProductById(productId);
        console.log("Product data received:", productData);
        
        if (!productData) {
          throw new Error("Product not found");
        }
        
        setProduct(productData);
        
        // Get related products from the same category
        if (productData.category) {
          console.log("Fetching related products for category:", productData.category);
          const categoryProducts = filterByCategory(productData.category);
          
          // Filter out current product and limit to 4
          const related = categoryProducts
            .filter(p => p.product_id !== productId)
            .slice(0, 4);
            
          console.log("Related products found:", related.length);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setPageError(err.message || "Failed to load product details");
      } finally {
        setPageLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, getProductById, filterByCategory, clearError]);

  // Show loading state
  if (pageLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (pageError || error) {
    const errorMessage = pageError || error;
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-red-600">{errorMessage}</h2>
        <p className="mt-2 text-gray-600">Sorry, we couldn't find the product you're looking for.</p>
        <div className="mt-6 space-x-4">
          <button 
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          <button 
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            onClick={() => navigate('/shop')}
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Show product not found if no product data
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Product Not Found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
        <button 
          className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Shop', path: '/shop' },
          { label: product.category, path: `/shop?category=${encodeURIComponent(product.category)}` },
          { label: product.name, path: '#' }
        ]} 
      />
      
      {/* Main product detail */}
      <ProductDetail product={product} />
      
      {/* Related products section */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDetailPage;