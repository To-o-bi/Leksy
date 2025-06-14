import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../api/services/productService';
import ProductDetail from '../../components/product/ProductDetail';
import RelatedProducts from '../../components/product/RelatedProducts';
import Breadcrumb from '../../components/common/Breadcrumb';
import Loader from '../../components/common/Loader';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Debug logging
  console.log("Rendering ProductDetailPage, product ID:", productId);

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log("Fetching product details for ID:", productId);
      try {
        setLoading(true);
        
        // Fetch the product by ID
        const productData = await getProductById(productId);
        console.log("Product data received:", productData);
        
        if (!productData) {
          console.error("Product not found");
          setError("Product not found");
          return;
        }
        
        setProduct(productData);
        
        // Get related products based on category
        try {
          console.log("Fetching related products for category:", productData.category);
          // Simplified related products logic - just get other products from the same category
          const allProducts = await import('../../data/product').then(module => module.products);
          
          const related = allProducts
            .filter(p => p.category === productData.category && p.id !== productId)
            .slice(0, 4);
            
          console.log("Related products found:", related.length);
          setRelatedProducts(related);
        } catch (relatedErr) {
          console.error("Error fetching related products:", relatedErr);
          // Don't fail the whole page if related products fail
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    } else {
      console.error("No product ID in URL parameters");
      setError("Product ID is missing");
      setLoading(false);
    }
  }, [productId]);

  // Simple loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
        <p className="mt-2 text-gray-600">Sorry, we couldn't find the product you're looking for.</p>
        <button 
          className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // Render the product details if we have data
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      {/* {product && (
        // <Breadcrumb 
        //   items={[
        //     { label: 'Home', path: '/' },
        //     { label: 'Shop', path: '/shop' },
        //     { label: product.category, path: /shop?category=${product.category} },
        //     { label: product.name, path: '#' }
        //   ]} 
        // />
      )} */}
      
      {/* Main product detail */}
      {product && <ProductDetail product={product} />}
      
      {/* Related products section */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDetailPage;