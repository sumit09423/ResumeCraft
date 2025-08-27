import { ENV_CONFIG } from '../../config/environment'

class AddressService {
  // Get address suggestions using Google Places API or fallback to Photon
  async getAddressSuggestions(query, limit = 5) {
    if (!query || query.length < 3) return []
    
    // Try Google Places API first if key is available
    if (ENV_CONFIG.GOOGLE_MAPS_API_KEY && ENV_CONFIG.GOOGLE_PLACES_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.GOOGLE_PLACES_API_URL}/autocomplete/json?input=${encodeURIComponent(query)}&types=address&key=${ENV_CONFIG.GOOGLE_MAPS_API_KEY}&language=en`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.predictions && data.predictions.length > 0) {
            // Get detailed place information for each prediction
            const detailedResults = await Promise.all(
              data.predictions.slice(0, limit).map(async (prediction) => {
                try {
                  const detailResponse = await fetch(
                    `${ENV_CONFIG.GOOGLE_PLACES_API_URL}/details/json?place_id=${prediction.place_id}&fields=formatted_address,address_components,geometry&key=${ENV_CONFIG.GOOGLE_MAPS_API_KEY}`
                  )
                  
                  if (detailResponse.ok) {
                    const detailData = await detailResponse.json()
                    const result = detailData.result
                    
                    // Parse address components
                    const addressComponents = this.parseGoogleAddressComponents(result.address_components)
                    
                    return {
                      id: prediction.place_id,
                      display: prediction.description,
                      street: addressComponents.street,
                      city: addressComponents.city,
                      state: addressComponents.state,
                      country: addressComponents.country,
                      postcode: addressComponents.postcode,
                      coordinates: {
                        lat: result.geometry.location.lat,
                        lon: result.geometry.location.lng
                      }
                    }
                  }
                } catch (error) {
                }
                

                return {
                  id: prediction.place_id,
                  display: prediction.description,
                  street: '',
                  city: '',
                  state: '',
                  country: '',
                  postcode: '',
                  coordinates: null
                }
              })
            )
            
            return detailedResults.filter(result => result)
          }
        }
      } catch (error) {
      }
    }
    

    if (ENV_CONFIG.PHOTON_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.PHOTON_API_URL}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) return []
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          return data.features
            .filter(feature => feature.properties && feature.properties.display_name) // Filter out features without display_name
            .map(feature => {
              const displayName = feature.properties.display_name || ''
              const streetName = feature.properties.street || displayName.split(',')[0] || ''
              
              return {
                id: feature.properties.osm_id || `feature-${Math.random()}`,
                display: displayName,
                street: streetName,
                city: feature.properties.city || feature.properties.town || '',
                state: feature.properties.state || '',
                country: feature.properties.country || '',
                postcode: feature.properties.postcode || '',
                coordinates: feature.geometry && feature.geometry.coordinates ? {
                  lat: feature.geometry.coordinates[1],
                  lon: feature.geometry.coordinates[0]
                } : null
              }
            })
            .filter(result => result.display && result.display.trim() !== '') // Filter out empty results
        }
        
        return []
      } catch (error) {
        return []
      }
    }
    
    return []
  }

  // Get street-level suggestions (for street input field)
  async getStreetSuggestions(query, limit = 5) {
    if (!query || query.length < 3) return []
    
    // Try Google Places API for street-level suggestions
    if (ENV_CONFIG.GOOGLE_MAPS_API_KEY && ENV_CONFIG.GOOGLE_PLACES_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.GOOGLE_PLACES_API_URL}/autocomplete/json?input=${encodeURIComponent(query)}&types=address&key=${ENV_CONFIG.GOOGLE_MAPS_API_KEY}&language=en`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.predictions && data.predictions.length > 0) {
            return data.predictions.slice(0, limit).map(prediction => ({
              id: prediction.place_id,
              display: prediction.description,
              street: prediction.description.split(',')[0] || prediction.description,
              city: '',
              state: '',
              country: '',
              postcode: '',
              coordinates: null
            }))
          }
        }
      } catch (error) {
      }
    }
    

    if (ENV_CONFIG.PHOTON_API_URL) {
      try {
        const url = `${ENV_CONFIG.PHOTON_API_URL}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=en`
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        })
        
        if (!response.ok) return []
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          const results = data.features
            .filter(feature => feature.properties && feature.properties.display_name) // Filter out features without display_name
            .map(feature => {
              const displayName = feature.properties.display_name || ''
              const streetName = feature.properties.street || displayName.split(',')[0] || ''
              
              return {
                id: feature.properties.osm_id || `feature-${Math.random()}`,
                display: displayName,
                street: streetName,
                city: feature.properties.city || feature.properties.town || '',
                state: feature.properties.state || '',
                country: feature.properties.country || '',
                postcode: feature.properties.postcode || '',
                coordinates: feature.geometry && feature.geometry.coordinates ? {
                  lat: feature.geometry.coordinates[1],
                  lon: feature.geometry.coordinates[0]
                } : null
              }
            })
            .filter(result => result.display && result.display.trim() !== '') // Filter out empty results
          
          return results
        }
        
        return []
      } catch (error) {
        return []
      }
    }
    
    return []
  }

  // Parse Google Places address components
  parseGoogleAddressComponents(components) {
    const result = {
      street: '',
      city: '',
      state: '',
      country: '',
      postcode: ''
    }
    
    components.forEach(component => {
      const types = component.types
      
      if (types.includes('street_number') || types.includes('route')) {
        result.street += component.long_name + ' '
      } else if (types.includes('locality') || types.includes('sublocality')) {
        result.city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.long_name
      } else if (types.includes('country')) {
        result.country = component.long_name
      } else if (types.includes('postal_code')) {
        result.postcode = component.long_name
      }
    })
    
    result.street = result.street.trim()
    return result
  }

  // Validate address using Google Geocoding API or fallback to Nominatim
  async validateAddress(address) {
    if (!address.street || !address.city || !address.state || !address.country) {
      return { isValid: false, message: 'Please fill in all address fields' }
    }

    // Try Google Geocoding API first if key is available
    if (ENV_CONFIG.GOOGLE_MAPS_API_KEY && ENV_CONFIG.GOOGLE_GEOCODING_API_URL) {
      try {
        const addressString = `${address.street}, ${address.city}, ${address.state}, ${address.country}`
        const response = await fetch(
          `${ENV_CONFIG.GOOGLE_GEOCODING_API_URL}/json?address=${encodeURIComponent(addressString)}&key=${ENV_CONFIG.GOOGLE_MAPS_API_KEY}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0]
            return { 
              isValid: true, 
              message: `✓ Address found: ${result.formatted_address}`,
              coordinates: { 
                lat: result.geometry.location.lat, 
                lon: result.geometry.location.lng 
              }
            }
          } else if (data.status === 'ZERO_RESULTS') {
            return { isValid: false, message: 'Address not found. Please check your details.' }
          } else {
          }
        }
      } catch (error) {
      }
    }


    if (ENV_CONFIG.NOMINATIM_API_URL) {
      try {
        const addressString = `${address.street}, ${address.city}, ${address.state}, ${address.country}`
        const response = await fetch(
          `${ENV_CONFIG.NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ResumeCraft/1.0'
            }
          }
        )
        
        if (!response.ok) {
          return { isValid: true, message: 'Address format looks good' }
        }
        
        const data = await response.json()
        
        if (data && data.length > 0) {
          const result = data[0]
          return { 
            isValid: true, 
            message: `✓ Address found: ${result.display_name}`,
            coordinates: { lat: result.lat, lon: result.lon }
          }
        } else {
          return { isValid: false, message: 'Address not found. Please check your details.' }
        }
      } catch (error) {
        return { isValid: true, message: 'Address format looks good' }
      }
    }

    // Default fallback
    return { isValid: true, message: 'Address format looks good' }
  }

  // Get city suggestions
  async getCitySuggestions(query, limit = 5) {
    if (!query || query.length < 2) return []
    
    if (ENV_CONFIG.PHOTON_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.PHOTON_API_URL}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=en&osm_tag=place:city`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) return []
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          return data.features
            .filter(feature => feature.properties && feature.properties.name) // Filter out features without name
            .map(feature => ({
              id: feature.properties.osm_id || `city-${Math.random()}`,
              name: feature.properties.name || '',
              state: feature.properties.state || '',
              country: feature.properties.country || ''
            }))
            .filter(result => result.name && result.name.trim() !== '') // Filter out empty results
        }
        
        return []
      } catch (error) {
        return []
      }
    }
    
    return []
  }

  // Get state suggestions
  async getStateSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return []
    
    if (ENV_CONFIG.PHOTON_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.PHOTON_API_URL}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=en&osm_tag=place:state`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) return []
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          return data.features
            .filter(feature => feature.properties && feature.properties.name) // Filter out features without name
            .map(feature => ({
              id: feature.properties.osm_id || `state-${Math.random()}`,
              name: feature.properties.name || '',
              country: feature.properties.country || ''
            }))
            .filter(result => result.name && result.name.trim() !== '') // Filter out empty results
        }
        
        return []
      } catch (error) {
        return []
      }
    }
    
    return []
  }

  // Get country suggestions
  async getCountrySuggestions(query, limit = 5) {
    if (!query || query.length < 2) return []
    
    if (ENV_CONFIG.PHOTON_API_URL) {
      try {
        const response = await fetch(
          `${ENV_CONFIG.PHOTON_API_URL}/api?q=${encodeURIComponent(query)}&limit=${limit}&lang=en&osm_tag=place:country`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        )
        
        if (!response.ok) return []
        
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          return data.features
            .filter(feature => feature.properties && feature.properties.name) // Filter out features without name
            .map(feature => ({
              id: feature.properties.osm_id || `country-${Math.random()}`,
              name: feature.properties.name || ''
            }))
            .filter(result => result.name && result.name.trim() !== '') // Filter out empty results
        }
        
        return []
      } catch (error) {
        return []
      }
    }
    
    return []
  }

  // Format address for display
  formatAddress(address) {
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.country) parts.push(address.country)
    if (address.postcode) parts.push(address.postcode)
    
    return parts.join(', ')
  }
}

// Create singleton instance
const addressService = new AddressService()

export default addressService
