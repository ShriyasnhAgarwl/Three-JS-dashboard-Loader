import axios from 'axios';

let API_URL = ''; // Update with the correct API endpoint


const setBaseUrlProd = (url) => {
  API_URL = url+'/products/';
};

const addProduct = async (formData) => {
  // Include configuration for sending the Authorization header with the JWT
  const userObject = JSON.parse(localStorage.getItem('user'));
  const token =  userObject ? userObject.token : null;
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`, // Assuming JWT is stored in localStorage
    },
  };
  // POST request to add a new product
  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

const getProducts = async () => {
  const userObject = JSON.parse(localStorage.getItem('user'));
  const token =  userObject ? userObject.token : null;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // Assuming JWT is stored in localStorage
      },
    };
  
    // GET request to fetch products
    const response = await axios.get(API_URL, config);
    return response.data;
  };

const getProductById = async (productId) => {
  const userObject = JSON.parse(localStorage.getItem('user'));
  const token =  userObject ? userObject.token : null;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // Assuming JWT is stored in localStorage
      },
    };
  
    // GET request to fetch products
    const response = await axios.get(`${API_URL}${productId}`, config);
    return response.data;
  };

const DeleteProductById = async (productId) => {
  const userObject = JSON.parse(localStorage.getItem('user'));
  const token =  userObject ? userObject.token : null;
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // Assuming JWT is stored in localStorage
      },
    };
  
    // GET request to fetch products
    const response = await axios.delete(`${API_URL}${productId}`, config);
    return response.data;
  };

  const updateProduct = async (productId, formData) => {
    try{

        // console.log('updating product details ' ,formData);
        // Include configuration for sending the Authorization header with the JWT
        const userObject = JSON.parse(localStorage.getItem('user'));
        const token = userObject ? userObject.token : null;
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`, // Assuming JWT is stored in localStorage
          },
        };
        // PATCH request to update an existing product
        const response = await axios.put(`${API_URL}${productId}`, formData, config);
        return response.data;
    }
    catch(er){
      console.error('error on updating product', er);
    }
  };

  const saveAnnotation = async (productId, annotation) => {
    try {
      const response = await axios.post(`${API_URL}/${productId}/annotations`, annotation);
      return response.data;
    } catch (error) {
      console.error('Error saving annotation:', error);
      throw error;
    }
  };
  
  const updateAnnotation = async (productId, annotationID, annotation) => {
    try {
      const response = await axios.put(`${API_URL}/${productId}/annotations/${annotationID}`, annotation);
      return response.data;
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw error;
    }
  };
  
  const fetchAnnotations = async (productId) => {
    try {
      const response = await axios.get(`${API_URL}${productId}/annotations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  };

  export const getAnnotationById = async (productId, annotationId) => {
    try {
      const response = await axios.get(`${API_URL}${productId}/annotations/${annotationId}`);
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Failed to fetch annotation details');
        return null;
      }
    } catch (error) {
      console.error('Error fetching annotation details:', error);
      return null;
    }
  };

  export const getProductURL = (productID) =>{
    const userObject = JSON.parse(localStorage.getItem('user'));
    const userID = userObject.user._id
    const productData = {
      getProduct: `${API_URL}public/details/${productID}`,
      getAnnotations: `${API_URL}${productID}/annotations`,
      getAllProducts: `${API_URL}public/${userID}`
    };
    return productData;
  };
export default {
  setBaseUrlProd, addProduct, getProducts, getProductById, updateProduct, DeleteProductById,
  saveAnnotation, fetchAnnotations, updateAnnotation,
  getAnnotationById, getProductURL
};