import React, { useEffect, useState, useContext } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../api/AuthContext';

// Validation helper regexes
const isAllCapsString = val => /^[A-Z\s]+$/.test(val);
const isAllCapsAlphaNumComma = val => /^[A-Z0-9,\s]+$/.test(val);
const isDateDDMMYYYY = val => /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(val);
const isNumber10Digits = val => /^\d{10}$/.test(val);
const isNumber12Digits = val => /^\d{12}$/.test(val);
const isLicenseNum15Alnum = val => /^[A-Z0-9]{15}$/.test(val);
const isValidFileType = (file, allowedTypes) => {
  if (!file) return false;
  const ext = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
};

const DriverSubmitForm = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    mobile: '',
    photo: null,
    aadhaarNum: '',
    aadhaarDoc: null,
    fatherName: '',
    address: '',
    nearestStation: '',
    vehicleNum: '',
    rcDoc: null,
    licenseNum: '',
    licenseDoc: null,
    insuranceNum: '',
    insuranceDoc: null,
    routeStart: '',
    routeEnd: '',
    pollutionDoc: null,
    crimeHistory: 'no',
    crimeDetails: '',
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // External dropdown data state
  const [stations, setStations] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Load existing data (for editing)
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/driver/my');
        if (res.data?.data) {
          setForm(prev => ({ ...prev, ...res.data.data }));
        }
      } catch {
        // No existing data
      }
    }
    loadData();
  }, []);

  // Load station and route names from public JSON folder
  useEffect(() => { 
    fetch('/stations.json')
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => setStations(data))
      .catch(() => setStations([]));

    fetch('/routes.json')
      .then(res => res.ok ? res.json() : Promise.reject('Failed'))
      .then(data => setRoutes(data))
      .catch(() => setRoutes([]));
  }, []);

  // Validation function for all fields
  const validateAllFields = () => {
    const newErrors = {};

    if (!form.firstName || !isAllCapsString(form.firstName)) newErrors.firstName = 'Must be ALL CAPITAL LETTERS only';
    if (!form.lastName || !isAllCapsString(form.lastName)) newErrors.lastName = 'Must be ALL CAPITAL LETTERS only';
    if (!form.dob || !isDateDDMMYYYY(form.dob)) newErrors.dob = 'Date of Birth must be in dd/mm/yyyy format';
    if (!form.mobile || !isNumber10Digits(form.mobile)) newErrors.mobile = 'Must be exactly 10 digits';
    if (!(form.photo instanceof File)) newErrors.photo = 'Photo is required';
    else if (!isValidFileType(form.photo, ['png', 'jpg', 'jpeg'])) newErrors.photo = 'Photo must be PNG, JPG, or JPEG';
    if (!form.aadhaarNum || !isNumber12Digits(form.aadhaarNum)) newErrors.aadhaarNum = 'Must be exactly 12 digits';
    if (!(form.aadhaarDoc instanceof File)) newErrors.aadhaarDoc = 'Aadhaar document is required';
    else if (!isValidFileType(form.aadhaarDoc, ['pdf'])) newErrors.aadhaarDoc = 'Aadhaar document must be PDF';
    if (!form.fatherName || !isAllCapsString(form.fatherName)) newErrors.fatherName = 'Must be ALL CAPITAL LETTERS only';
    if (!form.address || !isAllCapsAlphaNumComma(form.address))
      newErrors.address = 'Must be ALL CAPS, numbers, commas allowed';
    if (!form.nearestStation) newErrors.nearestStation = 'Please select nearest police station';
    if (!form.vehicleNum || !/^[A-Z0-9\s]+$/.test(form.vehicleNum)) newErrors.vehicleNum = 'Must be ALL CAPS letters and numbers only';
    if (form.rcDoc instanceof File && !isValidFileType(form.rcDoc, ['pdf'])) {
  newErrors.rcDoc = 'RC document must be a PDF';
}

    if (!form.licenseNum || !isLicenseNum15Alnum(form.licenseNum))
      newErrors.licenseNum = 'Must be 15 uppercase alphanumeric characters';
    if (form.licenseDoc instanceof File && !isValidFileType(form.licenseDoc, ['pdf'])) {
  newErrors.licenseDoc = 'License document must be a PDF';
    }
 if (!form.insuranceNum || !/^[A-Z0-9\s]+$/.test(form.insuranceNum))
      newErrors.insuranceNum = 'Must be ALL CAPS letters and numbers only';
    if (form.insuranceDoc instanceof File && !isValidFileType(form.insuranceDoc, ['pdf'])) {
  newErrors.insuranceDoc = 'Insurance document must be a PDF';
}
    if (!form.routeStart || !isAllCapsString(form.routeStart)) newErrors.routeStart = 'Must be ALL CAPS';
    if (!form.routeEnd || !isAllCapsString(form.routeEnd)) newErrors.routeEnd = 'Must be ALL CAPS';
   if (form.pollutionDoc instanceof File && !isValidFileType(form.pollutionDoc, ['pdf'])) {
  newErrors.pollutionDoc = 'Pollution document must be a PDF';
}

    if (!['yes', 'no'].includes(form.crimeHistory)) newErrors.crimeHistory = 'Please select yes or no';
    if (form.crimeHistory === 'yes' && !form.crimeDetails.trim()) newErrors.crimeDetails = 'Please describe your criminal history';

    return newErrors;
  };

  // Handle form field changes
  const handleChange = e => {
    const { name, value, files, type } = e.target;

    if (files) {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'radio') {
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      const val = ['firstName', 'lastName', 'fatherName', 'address', 'vehicleNum', 'nearestStation', 'routeStart', 'routeEnd', 'insuranceNum', 'licenseNum'].includes(name)
        ? value.toUpperCase()
        : value;
      setForm(prev => ({ ...prev, [name]: val }));
    }
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setServerError('');
    setSubmitAttempted(true);

    const newErrors = validateAllFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();
      for (const [key, val] of Object.entries(form)) {
        fd.append(key, val instanceof File ? val : val || '');
      }

      await api.post('/driver/submit', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Form submitted successfully!');
      navigate('/driver/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // CSS grid layout for form
  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: '180px 1fr',
    gap: '12px 20px',
    alignItems: 'center',
    maxWidth: 700,
    margin: 'auto'
  };

  const fullWidthStyle = {
    gridColumn: '1 / span 2',
    marginTop: '15px'
  };

  // Helper: Show error only after submission attempt
  const showError = field => submitAttempted && errors[field];

  return (
    <div style={{ maxWidth: 700, margin: 'auto', marginTop: 20 }}>
      <h2>Driver Data Submission Form</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" style={formGridStyle} noValidate>
        {/* First Name */}
        <label htmlFor="firstName">First Name (ALL CAPS)</label>
        <div>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('firstName') && <small style={{ color: 'red' }}>{errors.firstName}</small>}
        </div>

        {/* Last Name */}
        <label htmlFor="lastName">Last Name (ALL CAPS)</label>
        <div>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('lastName') && <small style={{ color: 'red' }}>{errors.lastName}</small>}
        </div>

        {/* Date of Birth */}
        <label htmlFor="dob">Date of Birth (dd/mm/yyyy)</label>
        <div>
          <input
            id="dob"
            name="dob"
            type="text"
            placeholder="e.g. 31/12/9999"
            value={form.dob}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('dob') && <small style={{ color: 'red' }}>{errors.dob}</small>}
        </div>

        {/* Mobile */}
        <label htmlFor="mobile">Mobile Number (10 digits)</label>
        <div>
          <input
            id="mobile"
            name="mobile"
            type="text"
            maxLength={10}
            value={form.mobile}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('mobile') && <small style={{ color: 'red' }}>{errors.mobile}</small>}
        </div>

        {/* Photo */}
        <label htmlFor="photo">Photo (.png, .jpg, .jpeg max 1MB)</label>
        <div>
          <input
            id="photo"
            name="photo"
            type="file"
            accept=".png,.jpg,.jpeg"
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('photo') && <small style={{ color: 'red' }}>{errors.photo}</small>}
        </div>

        {/* Aadhaar Number */}
        <label htmlFor="aadhaarNum">Aadhaar Number (12 digits)</label>
        <div>
          <input
            id="aadhaarNum"
            name="aadhaarNum"
            type="text"
            maxLength={12}
            value={form.aadhaarNum}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('aadhaarNum') && <small style={{ color: 'red' }}>{errors.aadhaarNum}</small>}
        </div>

        {/* Aadhaar Document */}
        <label htmlFor="aadhaarDoc">Aadhaar Document (.pdf)</label>
        <div>
          <input
            id="aadhaarDoc"
            name="aadhaarDoc"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('aadhaarDoc') && <small style={{ color: 'red' }}>{errors.aadhaarDoc}</small>}
        </div>

        {/* Father's Name */}
        <label htmlFor="fatherName">Father's Name (ALL CAPS)</label>
        <div>
          <input
            id="fatherName"
            name="fatherName"
            type="text"
            value={form.fatherName}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('fatherName') && <small style={{ color: 'red' }}>{errors.fatherName}</small>}
        </div>

        {/* Address */}
        <label htmlFor="address">Current Address (ALL CAPS, numbers, commas)</label>
        <div>
          <textarea
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            disabled={submitting}
            required
            rows={3}
          />
          {showError('address') && <small style={{ color: 'red' }}>{errors.address}</small>}
        </div>

        {/* Nearest Police Station */}
        <label htmlFor="nearestStation">Nearest Police Station</label>
        <div>
          <select
            id="nearestStation"
            name="nearestStation"
            value={form.nearestStation}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">-- Select Station --</option>
            {stations.length === 0 && <option disabled>Loading stations...</option>}
            {stations.map((station, idx) => (
              <option key={idx} value={station}>
                {station}
              </option>
            ))}
          </select>
          {showError('nearestStation') && <small style={{ color: 'red' }}>{errors.nearestStation}</small>}
        </div>

        {/* Vehicle Number */}
        <label htmlFor="vehicleNum">Vehicle Number (ALL CAPS letters and numbers)</label>
        <div>
          <input
            id="vehicleNum"
            name="vehicleNum"
            type="text"
            value={form.vehicleNum}
            onChange={handleChange}
            disabled={submitting}
            required
          />
          {showError('vehicleNum') && <small style={{ color: 'red' }}>{errors.vehicleNum}</small>}
        </div>

        {/* RC Document */}
        <label htmlFor="rcDoc">Registration Certificate Document (.pdf)</label>
        <div>
          <input
            id="rcDoc"
            name="rcDoc"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('rcDoc') && <small style={{ color: 'red' }}>{errors.rcDoc}</small>}
        </div>

        {/* License Number */}
        <label htmlFor="licenseNum">License Number (15 uppercase alphanumeric)</label>
        <div>
          <input
            id="licenseNum"
            name="licenseNum"
            type="text"
            maxLength={15}
            value={form.licenseNum}
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('licenseNum') && <small style={{ color: 'red' }}>{errors.licenseNum}</small>}
        </div>

        {/* License Document */}
        <label htmlFor="licenseDoc">License Document (.pdf)</label>
        <div>
          <input
            id="licenseDoc"
            name="licenseDoc"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('licenseDoc') && <small style={{ color: 'red' }}>{errors.licenseDoc}</small>}
        </div>

        {/* Insurance Number */}
        <label htmlFor="insuranceNum">Insurance Number (ALL CAPS letters and numbers)</label>
        <div>
          <input
            id="insuranceNum"
            name="insuranceNum"
            type="text"
            value={form.insuranceNum}
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('insuranceNum') && <small style={{ color: 'red' }}>{errors.insuranceNum}</small>}
        </div>

        {/* Insurance Document */}
        <label htmlFor="insuranceDoc">Insurance Document (.pdf)</label>
        <div>
          <input
            id="insuranceDoc"
            name="insuranceDoc"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('insuranceDoc') && <small style={{ color: 'red' }}>{errors.insuranceDoc}</small>}
        </div>

        {/* Route Start */}
        <label htmlFor="routeStart">Route Start (ALL CAPS)</label>
        <div>
          <select
            id="routeStart"
            name="routeStart"
            value={form.routeStart}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">-- Select Route --</option>
            {routes.length === 0 && <option disabled>Loading routes...</option>}
            {routes.map((route, idx) => (
              <option key={idx} value={route}>
                {route}
              </option>
            ))}
          </select>
          {showError('routeStart') && <small style={{ color: 'red' }}>{errors.routeStart}</small>}
        </div>

        {/* Route End */}
        <label htmlFor="routeEnd">Route End (ALL CAPS)</label>
        <div>
          <select
            id="routeEnd"
            name="routeEnd"
            value={form.routeEnd}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">-- Select Route --</option>
            {routes.length === 0 && <option disabled>Loading routes...</option>}
            {routes.map((route, idx) => (
              <option key={idx} value={route}>
                {route}
              </option>
            ))}
          </select>
          {showError('routeEnd') && <small style={{ color: 'red' }}>{errors.routeEnd}</small>}
        </div>

        {/* Pollution Document */}
        <label htmlFor="pollutionDoc">Pollution Check Document (.pdf)</label>
        <div>
          <input
            id="pollutionDoc"
            name="pollutionDoc"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={submitting}
            
          />
          {showError('pollutionDoc') && <small style={{ color: 'red' }}>{errors.pollutionDoc}</small>}
        </div>

        {/* Criminal History */}
        <label>Criminal History?</label>
        <div>
          <label>
            <input
              type="radio"
              name="crimeHistory"
              value="yes"
              checked={form.crimeHistory === 'yes'}
              onChange={handleChange}
              disabled={submitting}
            />{' '}
            Yes
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              name="crimeHistory"
              value="no"
              checked={form.crimeHistory === 'no'}
              onChange={handleChange}
              disabled={submitting}
            />{' '}
            No
          </label>
          {showError('crimeHistory') && <small style={{ color: 'red', display: 'block' }}>{errors.crimeHistory}</small>}
        </div>

        {/* Crime Details if yes */}
        {form.crimeHistory === 'yes' && (
          <>
            <label htmlFor="crimeDetails">Please describe your criminal history</label>
            <div>
              <textarea
                id="crimeDetails"
                name="crimeDetails"
                value={form.crimeDetails}
                onChange={handleChange}
                disabled={submitting}
                rows={3}
              />
              {showError('crimeDetails') && <small style={{ color: 'red' }}>{errors.crimeDetails}</small>}
            </div>
          </>
        )}

        {/* Server error */}
        {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

        {/* Submit button */}
        <div style={fullWidthStyle}>
          <button type="submit" disabled={submitting} style={{ padding: '8px 18px' }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverSubmitForm;
