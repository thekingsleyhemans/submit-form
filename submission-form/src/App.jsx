import React, { useState, useEffect } from 'react';
import './App.css'; // Import the CSS file for styling
import { supabase } from './supabaseClient'; // Import Supabase client

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artistName: '',
    artistEmail: '',
    artistAbout: '',
    artistImage: null,
    artistPortfolioLink: '',
    artistSocialLink: '',
    artworkTitle: '',
    artworkDetails: '',
    artworkImage: null,
    artworkCategory: '',
    artworkPrice: '',
    artworkSize: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const checkUserExists = async () => {
      const { data, error } = await supabase
        .from('street_art_submission')
        .select('artistName, artistEmail')
        .eq('artistName', formData.artistName)
        .eq('artistEmail', formData.artistEmail);

      if (error) {
        console.error('Error checking user:', error);
      } else if (data.length > 0) {
        setUserExists(true);
        setStep(3); // Skip to step 3 if user exists
      } else {
        setUserExists(false);
      }
    };

    if (formData.artistName && formData.artistEmail) {
      checkUserExists();
    }
  }, [formData.artistName, formData.artistEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  const nextStep = () => {
    setAnimationClass('slide-in');
    setTimeout(() => {
      setStep(step + 1);
      setAnimationClass('');
    }, 500);
  };

  const prevStep = () => {
    setAnimationClass('slide-out');
    setTimeout(() => {
      setStep(step - 1);
      setAnimationClass('');
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Upload files to Supabase Storage
    const artistImageUrl = await uploadFile(formData.artistImage, 'artist-photos');
    const artworkImageUrl = await uploadFile(formData.artworkImage, 'artwork-images');

    // Save form data to Supabase
    const { data, error } = await supabase
      .from('street_art_submission')
      .insert([{
        artistName: formData.artistName,
        artistEmail: formData.artistEmail,
        artistAbout: formData.artistAbout,
        artistImage: artistImageUrl,
        artistPortfolioLink: formData.artistPortfolioLink,
        artistSocialLink: formData.artistSocialLink,
        artworkTitle: formData.artworkTitle,
        artworkDetails: formData.artworkDetails,
        artworkImage: artworkImageUrl,
        artworkCategory: formData.artworkCategory,
        artworkPrice: formData.artworkPrice,
        artworkSize: formData.artworkSize
      }]);

    if (error) {
      console.error('Error inserting data:', error);
      setLoading(false);
    } else {
      console.log('Data inserted successfully:', data);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({
          artistName: '',
          artistEmail: '',
          artistAbout: '',
          artistImage: null,
          artistPortfolioLink: '',
          artistSocialLink: '',
          artworkTitle: '',
          artworkDetails: '',
          artworkImage: null,
          artworkCategory: '',
          artworkPrice: '',
          artworkSize: ''
        });
      }, 2000);
    }
  };

  const uploadFile = async (file, bucket) => {
    if (!file) return null;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(`${Date.now()}_${file.name}`, file);

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    const { publicURL } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.Key);

    return publicURL;
  };

  return (
    <div className="form-wrap">
      <h1 className="headertext">Submission Form</h1>
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className={`form-group ${animationClass}`}>
            <label htmlFor="artistName">Artist Name</label>
            <input type="text" id="artistName" name="artistName" value={formData.artistName} onChange={handleChange} />
            <label htmlFor="artistEmail">Artist Email</label>
            <input type="email" id="artistEmail" name="artistEmail" value={formData.artistEmail} onChange={handleChange} />
            <label htmlFor="artistAbout">Artist About <sup>*For new applicants only</sup></label>
            <textarea id="artistAbout" name="artistAbout" value={formData.artistAbout} onChange={handleChange}></textarea>
            <button type="button" className="btn" onClick={nextStep}>Next</button>
          </div>
        )}
        {!userExists && step === 2 && (
          <div className={`form-group ${animationClass}`}>
            <label htmlFor="artistImage">Artist Image <sup>*For new applicants only</sup></label>
            <input type="file" id="artistImage" name="artistImage" onChange={handleFileChange} />
            <label htmlFor="artistPortfolioLink">Artist Portfolio Link <sup>*For new applicants only</sup></label>
            <input type="text" id="artistPortfolioLink" name="artistPortfolioLink" value={formData.artistPortfolioLink} onChange={handleChange} />
            <label htmlFor="artistSocialLink">Artist Social Link <sup>*For new applicants only</sup></label>
            <input type="text" id="artistSocialLink" name="artistSocialLink" value={formData.artistSocialLink} onChange={handleChange} />
            <div className="btn-wrap">
              <button type="button" className="btn" onClick={prevStep}>Back</button>
              <button type="button" className="btn" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className={`form-group ${animationClass}`}>
            <label htmlFor="artworkImage">Artwork Image</label>
            <input type="file" id="artworkImage" name="artworkImage" onChange={handleFileChange} />
            <label htmlFor="artworkTitle">Artwork Title</label>
            <input type="text" id="artworkTitle" name="artworkTitle" value={formData.artworkTitle} onChange={handleChange} />
            <label htmlFor="artworkDetails">Artwork Details</label>
            <textarea id="artworkDetails" name="artworkDetails" value={formData.artworkDetails} onChange={handleChange}></textarea>
            <div className="btn-wrap">
              <button type="button" className="btn" onClick={prevStep}>Back</button>
              <button type="button" className="btn" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className={`form-group ${animationClass}`}>
            <label htmlFor="artworkCategory">Artwork Category</label>
            <input type="text" id="artworkCategory" name="artworkCategory" value={formData.artworkCategory} onChange={handleChange} />
            <label htmlFor="artworkPrice">Artwork Price</label>
            <input type="text" id="artworkPrice" name="artworkPrice" value={formData.artworkPrice} onChange={handleChange} />
            <label htmlFor="artworkSize">Artwork Size</label>
            <input type="text" id="artworkSize" name="artworkSize" value={formData.artworkSize} onChange={handleChange} />
            <div className="btn-wrap">
              <button type="button" className="btn" onClick={prevStep}>Back</button>
              <button type="submit" className="btn">Submit</button>
            </div>
          </div>
        )}
      </form>
      {loading && (
        <div className="modal">
          <div className="modal-content">
            <div className="loader"></div>
            <p>Submitting...</p>
          </div>
        </div>
      )}
      {success && (
        <div className="modal">
          <div className="modal-content">
            <div className="checkmark">🎉</div>
            <p style={{ color: 'rgb(44, 160, 44)' }}>Submission Successful!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
