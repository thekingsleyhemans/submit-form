import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./App.css"; // Import the CSS file for styling
import { supabase } from "./supabaseClient"; // Import Supabase client

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    artistName: "",
    artistEmail: "",
    artistAbout: "",
    artistImage: null,
    artistPortfolioLink: "",
    artistSocialLink: "",
    artworkTitle: "",
    artworkDetails: "",
    artworkImage: null,
    artworkCategory: "",
    artworkPrice: "",
    artworkSize: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [showAgreementModal, setShowAgreementModal] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkUserExists = async () => {
      const { data, error } = await supabase
        .from("street_art_submission")
        .select("artistName, artistEmail")
        .eq("artistName", formData.artistName)
        .eq("artistEmail", formData.artistEmail);

      if (error) {
        console.error("Error checking user:", error);
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
      [name]: value,
    });
  };

  const handleFileChange = (acceptedFiles, name) => {
    setFormData({
      ...formData,
      [name]: acceptedFiles[0],
    });
  };

  const removeFile = (name) => {
    setFormData({
      ...formData,
      [name]: null,
    });
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.artistName) newErrors.artistName = "Artist Name is required";
      if (!formData.artistEmail) newErrors.artistEmail = "Artist Email is required";
    } else if (step === 2) {
      if (!formData.artistImage) newErrors.artistImage = "Artist Image is required";
      if (!formData.artistPortfolioLink) newErrors.artistPortfolioLink = "Artist Portfolio Link is required";
      if (!formData.artistSocialLink) newErrors.artistSocialLink = "Artist Social Link is required";
    } else if (step === 3) {
      if (!formData.artworkImage) newErrors.artworkImage = "Artwork Image is required";
      if (!formData.artworkTitle) newErrors.artworkTitle = "Artwork Title is required";
      if (!formData.artworkDetails) newErrors.artworkDetails = "Artwork Details are required";
    } else if (step === 4) {
      if (!formData.artworkCategory) newErrors.artworkCategory = "Artwork Category is required";
      if (!formData.artworkPrice) newErrors.artworkPrice = "Artwork Price is required";
      if (!formData.artworkSize) newErrors.artworkSize = "Artwork Size is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setAnimationClass("slide-in");
      setTimeout(() => {
        setStep(step + 1);
        setAnimationClass("");
      }, 500);
    }
  };

  const prevStep = () => {
    setAnimationClass("slide-out");
    setTimeout(() => {
      setStep(step - 1);
      setAnimationClass("");
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // Upload files to Supabase Storage
    const artistImageUrl = await uploadFile(
      formData.artistImage,
      "artist-photos"
    );
    const artworkImageUrl = await uploadFile(
      formData.artworkImage,
      "artwork-images"
    );

    // Save form data to Supabase
    const { data, error } = await supabase
      .from("street_art_submission")
      .insert([
        {
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
          artworkSize: formData.artworkSize,
        },
      ]);

    if (error) {
      console.error("Error inserting data:", error);
      setLoading(false);
    } else {
      console.log("Data inserted successfully:", data);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({
          artistName: "",
          artistEmail: "",
          artistAbout: "",
          artistImage: null,
          artistPortfolioLink: "",
          artistSocialLink: "",
          artworkTitle: "",
          artworkDetails: "",
          artworkImage: null,
          artworkCategory: "",
          artworkPrice: "",
          artworkSize: "",
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
      console.error("Error uploading file:", error);
      return null;
    }

    const { publicURL } = supabase.storage.from(bucket).getPublicUrl(data.Key);

    return publicURL;
  };

  const Dropzone = ({ onDrop, name }) => {
    const onDropCallback = useCallback(
      (acceptedFiles) => {
        onDrop(acceptedFiles, name);
      },
      [onDrop, name]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: onDropCallback,
      multiple: false,
    });

    return (
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag & drop some files here, or click to select files</p>
        )}
        {formData[name] && (
          <div className="file-preview">
            <div className="thumb-name-wrap">
              <img
                src={URL.createObjectURL(formData[name])}
                alt="Preview"
                className="file-thumbnail"
              />
              <p>{formData[name].name}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(name);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleAgreementChange = (e) => {
    setAgreedToTerms(e.target.checked);
    setShowReminder(false); // Hide reminder when checkbox is checked/unchecked
  };

  const handleAgreementSubmit = () => {
    if (agreedToTerms) {
      setShowAgreementModal(false);
    } else {
      setShowReminder(true); // Show reminder if checkbox is not checked
    }
  };

  return (
    <div className="form-wrap">
      {showAgreementModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Agreement</h2>
            <p className="agreement-text">
              1. Please provide a valid email address. We’ll use
              this to update you on the status of your submission and any
              related communications.<br /><br />
              2. Upload clear,
              high-quality images of your work. Each file should be no larger
              than 3MB to ensure proper review. <br /><br />
              3. Broccoli Street Art retains a 10% commission on all sales made through our
              store. Artists are responsible for handling all shipping and delivery of sold artworks.<br/> <br />
              By submitting, you agree to the submission policies of Broccoli Street Art.
            </p>
            <label className="agreement-check">
              <input
                className="check-check"
                type="checkbox"
                checked={agreedToTerms}
                onChange={handleAgreementChange}
              />
              <p className="tnc">I Agree to the Terms and Conditions</p>
            </label>
            <button
              type="button"
              className="btn"
              onClick={handleAgreementSubmit}
            >
              I Agree
            </button>
            {showReminder && (
              <p style={{ color: "red" }}>
                Please check the box to agree to the terms.
              </p>
            )}
          </div>
        </div>
      )}
      {!showAgreementModal && (
        <>
          <h1 className="headertext">Submission Form</h1>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className={`form-group ${animationClass}`}>
                <label htmlFor="artistName">Artist Name</label>
                <input
                  type="text"
                  id="artistName"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                />
                {errors.artistName && <p style={{ color: "red" }}>{errors.artistName}</p>}
                <label htmlFor="artistEmail">Artist Email</label>
                <input
                  type="email"
                  id="artistEmail"
                  name="artistEmail"
                  value={formData.artistEmail}
                  onChange={handleChange}
                />
                {errors.artistEmail && <p style={{ color: "red" }}>{errors.artistEmail}</p>}
                <label htmlFor="artistAbout">
                  Artist About <sup>*For new applicants only</sup>
                </label>
                <textarea
                  id="artistAbout"
                  name="artistAbout"
                  value={formData.artistAbout}
                  onChange={handleChange}
                ></textarea>
                <button type="button" className="btn" onClick={nextStep}>
                  Next
                </button>
              </div>
            )}
            {!userExists && step === 2 && (
              <div className={`form-group ${animationClass}`}>
                <label htmlFor="artistImage">
                  Artist Image{" "}
                  <sup>
                    <sup>*Max file size 10MB </sup>
                  </sup>
                </label>
                <Dropzone onDrop={handleFileChange} name="artistImage" />
                {errors.artistImage && <p style={{ color: "red" }}>{errors.artistImage}</p>}
                <label htmlFor="artistPortfolioLink">
                  Artist Portfolio Link <sup>*For new applicants only</sup>
                </label>
                <input
                  type="text"
                  id="artistPortfolioLink"
                  name="artistPortfolioLink"
                  value={formData.artistPortfolioLink}
                  onChange={handleChange}
                />
                {errors.artistPortfolioLink && <p style={{ color: "red" }}>{errors.artistPortfolioLink}</p>}
                <label htmlFor="artistSocialLink">
                  Artist Social Link <sup>*For new applicants only</sup>
                </label>
                <input
                  type="text"
                  id="artistSocialLink"
                  name="artistSocialLink"
                  value={formData.artistSocialLink}
                  onChange={handleChange}
                />
                {errors.artistSocialLink && <p style={{ color: "red" }}>{errors.artistSocialLink}</p>}
                <div className="btn-wrap">
                  <button type="button" className="btn" onClick={prevStep}>
                    Back
                  </button>
                  <button type="button" className="btn" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className={`form-group ${animationClass}`}>
                <label htmlFor="artworkImage">
                  Artwork Image <sup>*Max file size 10MB </sup>
                </label>
                <Dropzone onDrop={handleFileChange} name="artworkImage" />
                {errors.artworkImage && <p style={{ color: "red" }}>{errors.artworkImage}</p>}
                <label htmlFor="artworkTitle">Artwork Title</label>
                <input
                  type="text"
                  id="artworkTitle"
                  name="artworkTitle"
                  value={formData.artworkTitle}
                  onChange={handleChange}
                />
                {errors.artworkTitle && <p style={{ color: "red" }}>{errors.artworkTitle}</p>}
                <label htmlFor="artworkDetails">Artwork Details</label>
                <textarea
                  id="artworkDetails"
                  name="artworkDetails"
                  value={formData.artworkDetails}
                  onChange={handleChange}
                ></textarea>
                {errors.artworkDetails && <p style={{ color: "red" }}>{errors.artworkDetails}</p>}
                <div className="btn-wrap">
                  <button type="button" className="btn" onClick={prevStep}>
                    Back
                  </button>
                  <button type="button" className="btn" onClick={nextStep}>
                    Next
                  </button>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className={`form-group ${animationClass}`}>
                <label htmlFor="artworkCategory">Artwork Category</label>
                <input
                  type="text"
                  id="artworkCategory"
                  name="artworkCategory"
                  value={formData.artworkCategory}
                  onChange={handleChange}
                />
                {errors.artworkCategory && <p style={{ color: "red" }}>{errors.artworkCategory}</p>}
                <label htmlFor="artworkPrice">
                  Artwork Price <sup>*GHC </sup>
                </label>
                <input
                  type="text"
                  id="artworkPrice"
                  name="artworkPrice"
                  value={formData.artworkPrice}
                  onChange={handleChange}
                />
                {errors.artworkPrice && <p style={{ color: "red" }}>{errors.artworkPrice}</p>}
                <label htmlFor="artworkSize">
                  Artwork Size <sup>*W x H inches</sup>
                </label>
                <input
                  type="text"
                  id="artworkSize"
                  name="artworkSize"
                  value={formData.artworkSize}
                  onChange={handleChange}
                />
                {errors.artworkSize && <p style={{ color: "red" }}>{errors.artworkSize}</p>}
                <div className="btn-wrap">
                  <button type="button" className="btn" onClick={prevStep}>
                    Back
                  </button>
                  <button type="submit" className="btn">
                    Submit
                  </button>
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
                <p style={{ color: "rgb(44, 160, 44)" }}>
                  Submission Successful!
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
