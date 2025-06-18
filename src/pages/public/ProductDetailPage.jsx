import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../api/services';
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

  console.log("Rendering ProductDetailPage, product ID:", productId);

  useEffect(() => {
    const fetchProductDetails = async () => {
      console.log("Fetching product details for ID:", productId);
      try {
        setLoading(true);
        
        const apiResponse = await productService.fetchProduct(productId);
        console.log("Raw API response:", apiResponse);
        
        if (!apiResponse || !apiResponse.product) {
          console.error("Product not found in API response");
          setError("Product not found");
          return;
        }

        // Extract the actual product data from the nested structure
        const productData = apiResponse.product;
        
        // LOG THE COMPLETE STRUCTURE
        console.log("Product data structure:", {
          keys: Object.keys(productData),
          values: productData
        });

        // NORMALIZE THE PRODUCT DATA
        const normalizedProduct = {
          id: productData.product_id || productData.id || productData._id,
          name: productData.name || productData.title || productData.product_name || 'Unknown Product',
          price: parseFloat(productData.price) || parseFloat(productData.cost) || 0,
          originalPrice: productData.slashed_price ? parseFloat(productData.slashed_price) || 0 : undefined,
          description: productData.description || productData.desc || '',
          image: productData.images?.[0] || productData.image || '/placeholder-image.jpg',
          images: productData.images || [productData.image] || [],
          category: productData.category || productData.category_name || 'Uncategorized',
          brand: productData.brand || productData.manufacturer || '',
          stock: parseInt(productData.available_qty) || parseInt(productData.stock) || parseInt(productData.inventory) || 0,
          rating: parseFloat(productData.rating) || 0,
          reviews: productData.reviews || [],
          features: productData.features || productData.key_benefits || [],
          isNew: productData.isNew || productData.is_new || false,
          discount: productData.discount || 0,
          // Add any other fields your ProductDetail component expects
          ...productData // Keep original data as fallback
        };

        console.log("Normalized product:", normalizedProduct);
        
        setProduct(normalizedProduct);
        
        // Get related products based on category
        try {
          if (normalizedProduct.category && normalizedProduct.category !== 'Uncategorized') {
            console.log("Fetching related products for category:", normalizedProduct.category);
            
            const relatedData = await productService.fetchProducts({
              categories: [normalizedProduct.category],
              limit: 5
            });
            
            const related = relatedData.products
              ? relatedData.products
                  .filter(p => (p.id || p._id) !== productId)
                  .slice(0, 4)
                  .map(p => ({
                    // Normalize related products too
                    id: p.id || p._id || p.product_id,
                    name: p.name || p.title || 'Unknown Product',
                    price: parseFloat(p.price) || 0,
                    image: p.image || p.images?.[0] || '/placeholder-image.jpg',
                    category: p.category || 'Uncategorized',
                    ...p
                  }))
              : [];
              
            console.log("Related products found:", related.length);
            setRelatedProducts(related);
          }
        } catch (relatedErr) {
          console.error("Error fetching related products:", relatedErr);
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(`Failed to load product details: ${err.message}`);
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
          className="mt-6 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // DEBUG: Show raw product data if still having issues
  if (product && (product.name === 'Unknown Product' || isNaN(product.price))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <h3 className="font-bold">Debug: Product Data Issue</h3>
          <p>Check console for product structure. Raw data:</p>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(product, null, 2)}
          </pre>
        </div>
        <button 
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          onClick={() => navigate('/shop')}
        >
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {product && <ProductDetail product={product} />}
      
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDetailPage;