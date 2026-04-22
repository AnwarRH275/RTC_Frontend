import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/subscription-packs`;

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  
  // Vérifier si le token existe et n'est pas vide
  if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
    console.warn('Token d\'accès manquant ou invalide dans localStorage');
    throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
  }
  
  // console.log('Token trouvé dans localStorage:', token.substring(0, 20) + '...');
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

class SubscriptionPackService {
  // Get all subscription packs
  async getAllPacks(activeOnly = false) {
    try {
      const url = activeOnly ? `${API_URL}/packs?active_only=true` : `${API_URL}/packs`;
      // console.log('Fetching packs from:', url);
      const response = await axios.get(url, getAuthHeader());
      // console.log('Packs response:', response.data);
      
      // Vérifier si la réponse est un tableau
      if (!Array.isArray(response.data)) {
        console.error('Response is not an array:', response.data);
        throw new Error('Format de réponse invalide');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription packs:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get active packs only (public endpoint)
  async getActivePacks() {
    try {
      const response = await axios.get(`${API_URL}/active-packs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active packs:', error);
      throw error;
    }
  }

  // Get a specific pack by ID
  async getPackById(id) {
    try {
      // console.log('Fetching pack by ID:', id);
      const response = await axios.get(`${API_URL}/packs/${id}`, getAuthHeader());
      // console.log('Pack response:', response.data);
      
      // Vérifier si la réponse contient les données attendues
      if (!response.data || typeof response.data !== 'object') {
        console.error('Invalid pack data:', response.data);
        throw new Error('Données du pack invalides');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching pack by ID:', error.response?.data || error.message);
      throw error;
    }
  }

  // Create a new subscription pack (admin only)
  async createPack(packData) {
    try {
      // console.log('Creating pack with data:', packData);
      const response = await axios.post(`${API_URL}/packs`, packData, getAuthHeader());
      // console.log('Create pack response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating pack:', error.response?.data || error.message);
      throw error;
    }
  }

  // Update an existing pack (admin only)
  async updatePack(id, packData) {
    try {
      // console.log('Updating pack ID:', id, 'with data:', packData);
      const response = await axios.put(`${API_URL}/packs/${id}`, packData, getAuthHeader());
      // console.log('Update pack response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating pack:', error.response?.data || error.message);
      throw error;
    }
  }

  // Delete a pack (admin only)
  async deletePack(id) {
    try {
      const response = await axios.delete(`${API_URL}/packs/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error deleting pack:', error);
      throw error;
    }
  }

  // Toggle pack status (activate/deactivate)
  async togglePackStatus(id) {
    try {
      // console.log('Toggling status for pack ID:', id);
      const response = await axios.patch(`${API_URL}/packs/${id}/toggle-status`, {}, getAuthHeader());
      // console.log('Toggle status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling pack status:', error.response?.data || error.message);
      throw error;
    }
  }

  // Validate pack data before sending to API
  validatePackData(packData) {
    const errors = [];

    if (!packData.pack_id || packData.pack_id.trim() === '') {
      errors.push('Pack ID is required');
    }

    if (!packData.name || packData.name.trim() === '') {
      errors.push('Pack name is required');
    }

    if (!packData.price || packData.price.trim() === '') {
      errors.push('Price is required');
    }

    if (!packData.priceInCents || packData.priceInCents <= 0) {
      errors.push('Price in cents must be greater than 0');
    }

    if (!packData.usages || packData.usages <= 0) {
      errors.push('Usages must be greater than 0');
    }

    if (!packData.color || packData.color.trim() === '') {
      errors.push('Color is required');
    }

    if (!packData.stripeProductId || packData.stripeProductId.trim() === '') {
      errors.push('Stripe Product ID is required');
    }

    if (!packData.headerGradient || !packData.headerGradient.start || !packData.headerGradient.end) {
      errors.push('Header gradient colors are required');
    }

    if (!packData.buttonGradient || !packData.buttonGradient.start || !packData.buttonGradient.end) {
      errors.push('Button gradient colors are required');
    }

    if (!packData.buttonHoverGradient || !packData.buttonHoverGradient.start || !packData.buttonHoverGradient.end) {
      errors.push('Button hover gradient colors are required');
    }

    if (!packData.features || !Array.isArray(packData.features) || packData.features.length === 0) {
      errors.push('At least one feature is required');
    }

    return errors;
  }

  // Helper method to format pack data for API
  formatPackForAPI(formData) {
    return {
      pack_id: formData.pack_id,
      name: formData.name,
      price: formData.price,
      priceInCents: parseInt(formData.priceInCents),
      usages: parseInt(formData.usages),
      color: formData.color,
      isPopular: formData.isPopular || false,
      stripeProductId: formData.stripeProductId,
      headerGradient: {
        start: formData.headerGradient.start,
        end: formData.headerGradient.end
      },
      buttonGradient: {
        start: formData.buttonGradient.start,
        end: formData.buttonGradient.end
      },
      buttonHoverGradient: {
        start: formData.buttonHoverGradient.start,
        end: formData.buttonHoverGradient.end
      },
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      features: formData.features || []
    };
  }

  // Helper method to get color options for UI
  getColorOptions() {
    return [
      { value: 'standard', label: 'Standard (Blue)', color: '#0062E6' },
      { value: 'performance', label: 'Performance (Red/Pink)', color: '#FF512F' },
      { value: 'pro', label: 'Pro (Green)', color: '#11998e' },
      { value: 'custom', label: 'Custom', color: '#666666' }
    ];
  }

  // Helper method to get default gradient colors based on pack type
  getDefaultGradients(color) {
    const gradients = {
      standard: {
        header: { start: '#0062E6', end: '#33AEFF' },
        button: { start: '#0062E6', end: '#33AEFF' },
        buttonHover: { start: '#0062E6', end: '#0062E6' }
      },
      performance: {
        header: { start: '#FF512F', end: '#DD2476' },
        button: { start: '#FF512F', end: '#DD2476' },
        buttonHover: { start: '#DD2476', end: '#DD2476' }
      },
      pro: {
        header: { start: '#11998e', end: '#38ef7d' },
        button: { start: '#11998e', end: '#38ef7d' },
        buttonHover: { start: '#11998e', end: '#11998e' }
      }
    };

    return gradients[color] || gradients.standard;
  }
}

export default new SubscriptionPackService();