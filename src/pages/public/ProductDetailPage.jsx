import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
import ProductDetail from '../../components/product/ProductDetail';
import RelatedProducts from '../../components/product/RelatedProducts';
import Loader from '../../components/common/Loader';

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
          return;
        }

        // The product data is already normalized in the ProductDetail component
        // So we just pass the raw API response
        const productData = apiResponse.product;
        setProduct(productData);
        
        // Fetch related products based on category
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
          // Don't fail the whole page if related products fail
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(`Failed to load product details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {product && <ProductDetail product={product} />}
        
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;