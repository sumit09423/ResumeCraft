import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authService } from '../../api'
import addressService from '../../api/Model/addressService'
import AutocompleteInput from '../Common/AutocompleteInput'
import Header from '../Layout/Header'



const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [isValidatingAddress, setIsValidatingAddress] = useState(false)
  const [addressValidation, setAddressValidation] = useState(null)
  

  const [streetSuggestions, setStreetSuggestions] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [stateSuggestions, setStateSuggestions] = useState([])
  const [countrySuggestions, setCountrySuggestions] = useState([])
  const [isLoadingStreet, setIsLoadingStreet] = useState(false)
  const [isLoadingCity, setIsLoadingCity] = useState(false)
  const [isLoadingState, setIsLoadingState] = useState(false)
  const [isLoadingCountry, setIsLoadingCountry] = useState(false)
  
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobileNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    }
  })

  const password = watch('password')





  // Real-time address validation with geolocation
  const validateAddress = async (address) => {
    return await addressService.validateAddress(address)
  }

  // Get address suggestions
  const getAddressSuggestions = async (query, type) => {
    if (!query || query.length < 2) return
    
    switch (type) {
      case 'street':
        setIsLoadingStreet(true)
        const streetResults = await addressService.getAddressSuggestions(query)
        setStreetSuggestions(streetResults)
        setIsLoadingStreet(false)
        break
      case 'city':
        setIsLoadingCity(true)
        const cityResults = await addressService.getCitySuggestions(query)
        setCitySuggestions(cityResults)
        setIsLoadingCity(false)
        break
      case 'state':
        setIsLoadingState(true)
        const stateResults = await addressService.getStateSuggestions(query)
        setStateSuggestions(stateResults)
        setIsLoadingState(false)
        break
      case 'country':
        setIsLoadingCountry(true)
        const countryResults = await addressService.getCountrySuggestions(query)
        setCountrySuggestions(countryResults)
        setIsLoadingCountry(false)
        break
    }
  }



  // Handle address field selection from autocomplete
  const handleAddressFieldSelect = (suggestion, field) => {
    if (field === 'street') {
      setValue('address.street', suggestion.street || suggestion.display)
      if (suggestion.city) setValue('address.city', suggestion.city)
      if (suggestion.state) setValue('address.state', suggestion.state)
      if (suggestion.country) setValue('address.country', suggestion.country)
      if (suggestion.postcode) setValue('address.zipCode', suggestion.postcode)
    } else if (field === 'city') {
      setValue('address.city', suggestion.name)
      if (suggestion.state) setValue('address.state', suggestion.state)
      if (suggestion.country) setValue('address.country', suggestion.country)
    } else if (field === 'state') {
      setValue('address.state', suggestion.name)
      if (suggestion.country) setValue('address.country', suggestion.country)
    } else if (field === 'country') {
      setValue('address.country', suggestion.name)
    }
    
    // Clear suggestions
    setStreetSuggestions([])
    setCitySuggestions([])
    setStateSuggestions([])
    setCountrySuggestions([])
  }



  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Only send required fields per Auth.md specification
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      }

      // Add optional fields only if they have values
      if (data.mobileNumber && data.mobileNumber.trim()) {
        registrationData.mobileNumber = data.mobileNumber.trim()
      }
      
      if (data.address.street && data.address.street.trim()) {
        registrationData.address = {
          street: data.address.street.trim(),
          city: data.address.city.trim(),
          state: data.address.state.trim(),
          country: data.address.country.trim(),
          zipCode: data.address.zipCode.trim()
        }
      }

      const response = await authService.register(registrationData)

      if (response.success) {
        setSubmittedEmail(data.email)
        setIsEmailSent(true)
      } else {
        // Handle API error response
        window.showToast(response.message || 'Registration failed', 'error')
      }
      
    } catch (error) {
      // Handle network or other errors
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      window.showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <>
        <Header />
        
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a verification link to {submittedEmail}
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <div className="text-orange-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Verify your email address
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Click the link in the email we sent to verify your account and start building your resume.
              </p>
              <button
                onClick={() => {
                  setIsEmailSent(false)
                  setSubmittedEmail('')
                }}
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              

              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      {...register('firstName', {
                        required: 'First name is required'
                      })}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      {...register('lastName', {
                        required: 'Last name is required'
                      })}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                  Mobile Number (International) - Optional
                </label>
                <div className="mt-1">
                  <input
                    id="mobileNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1234567890"
                    {...register('mobileNumber', {
                      pattern: {
                        value: /^\+[1-9]\d{1,14}$/,
                        message: 'Please enter a valid international mobile number (e.g., +1234567890)'
                      },
                      validate: (value) => {
                        if (!value) return true // Optional field
                        // Remove all non-digit characters except +
                        const cleaned = value.replace(/[^\d+]/g, '')
                        // Must start with + and have 7-15 digits total
                        if (!/^\+[1-9]\d{6,14}$/.test(cleaned)) {
                          return 'Please enter a valid international mobile number starting with + followed by country code and number'
                        }
                        return true
                      }
                    })}
                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.mobileNumber.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your mobile number in international format (e.g., +1234567890)
                  </p>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information (Optional)</h3>
                
                <div className="space-y-4">
                                    <div>
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <div className="mt-1">
                      <AutocompleteInput
                        value={watch('address.street')}
                        onChange={(e) => setValue('address.street', e.target.value)}
                        onSelect={(suggestion) => {
                          setValue('address.street', suggestion)
                          handleAddressFieldSelect(suggestion, 'street')
                        }}
                        placeholder="Start typing street address..."
                        suggestions={streetSuggestions}
                        isLoading={isLoadingStreet}
                        name="address.street"
                        className={errors['address.street'] ? 'border-red-300' : 'border-gray-300'}
                      />
                      {errors['address.street'] && (
                        <p className="mt-2 text-sm text-red-600">{errors['address.street'].message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <div className="mt-1">
                        <AutocompleteInput
                          value={watch('address.city')}
                          onChange={(e) => setValue('address.city', e.target.value)}
                          onSelect={(suggestion) => {
                            setValue('address.city', suggestion)
                            handleAddressFieldSelect(suggestion, 'city')
                          }}
                          placeholder="Start typing city name..."
                          suggestions={citySuggestions}
                          isLoading={isLoadingCity}
                          name="address.city"
                          className={errors['address.city'] ? 'border-red-300' : 'border-gray-300'}
                        />
                        {errors['address.city'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.city'].message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <div className="mt-1">
                        <AutocompleteInput
                          value={watch('address.state')}
                          onChange={(e) => setValue('address.state', e.target.value)}
                          onSelect={(suggestion) => {
                            setValue('address.state', suggestion)
                            handleAddressFieldSelect(suggestion, 'state')
                          }}
                          placeholder="Start typing state/province..."
                          suggestions={stateSuggestions}
                          isLoading={isLoadingState}
                          name="address.state"
                          className={errors['address.state'] ? 'border-red-300' : 'border-gray-300'}
                        />
                        {errors['address.state'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.state'].message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <div className="mt-1">
                        <AutocompleteInput
                          value={watch('address.country')}
                          onChange={(e) => setValue('address.country', e.target.value)}
                          onSelect={(suggestion) => {
                            setValue('address.country', suggestion)
                            handleAddressFieldSelect(suggestion, 'country')
                          }}
                          placeholder="Start typing country name..."
                          suggestions={countrySuggestions}
                          isLoading={isLoadingCountry}
                          name="address.country"
                          className={errors['address.country'] ? 'border-red-300' : 'border-gray-300'}
                        />
                        {errors['address.country'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.country'].message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                        ZIP/Postal Code
                      </label>
                      <div className="mt-1">
                        <input
                          id="address.zipCode"
                          type="text"
                          autoComplete="postal-code"
                          {...register('address.zipCode', {
                            validate: (value) => {
                              const address = watch('address')
                              const hasAnyAddressField = address.street || address.city || address.state || address.country || value
                              if (hasAnyAddressField && !value) {
                                return 'ZIP/Postal Code is required when providing address information'
                              }
                              return true
                            }
                          })}
                          className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                            errors['address.zipCode'] ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors['address.zipCode'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.zipCode'].message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Address Validation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-end">
                      {isValidatingAddress && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          <span className="text-sm text-gray-600">Validating address...</span>
                        </div>
                      )}
                      {addressValidation && !isValidatingAddress && (
                        <span className={`text-sm ${addressValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {addressValidation.message}
                        </span>
                      )}
                    </div>
                    

                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="border-t border-gray-200 pt-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters long'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                        }
                      })}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link to="/terms" className="text-orange-500 hover:text-orange-600">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  <span className="ml-2">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
