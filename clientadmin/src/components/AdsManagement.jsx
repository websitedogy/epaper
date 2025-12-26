import { useState, useEffect } from "react";
import { epaperAPI } from "../services/api";

const AdsManagement = () => {
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    redirectUrl: "",
    position: "sidebar",
    isActive: true,
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file.");
      return;
    }

    // In a real implementation, you would upload the file to a server
    // and get back a URL. For now, we'll just show a preview.
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      setFormData({ ...formData, image: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await epaperAPI.getEpaper();
      setAds(response.data.ads || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAd) {
        await epaperAPI.updateAd(editingAd._id, formData);
      } else {
        await epaperAPI.createAd(formData);
      }

      fetchAds();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!window.confirm("Delete this ad?")) return;

    try {
      await epaperAPI.deleteAd(adId);
      fetchAds();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      redirectUrl: "",
      position: "top",
      isActive: true,
    });
    setEditingAd(null);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image: ad.image,
      redirectUrl: ad.redirectUrl,
      position: ad.position || "top",
      isActive: ad.isActive,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ads Management</h2>
          <p className="text-gray-600 mt-1">Manage your advertisements</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Ad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div
            key={ad._id}
            className="bg-white rounded-xl shadow-md border overflow-hidden"
          >
            <img
              src={ad.image}
              alt={ad.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{ad.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    ad.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {ad.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Image Preview */}
              {ad.image && (
                <div className="mb-3">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}

              <p className="text-sm text-gray-600 mb-2 truncate">
                {ad.redirectUrl}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Position: {ad.position}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(ad)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(ad._id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-20 w-20 object-cover border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: "" })}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload image (image will be stored as URL)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Redirect URL *
                  </label>
                  <input
                    type="url"
                    value={formData.redirectUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, redirectUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label className="ml-2 text-sm font-medium">Active</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {loading ? "Saving..." : editingAd ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsManagement;
