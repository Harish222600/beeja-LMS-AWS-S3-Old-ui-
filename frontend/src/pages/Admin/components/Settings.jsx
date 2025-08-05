import { useState } from "react";
import { FaPalette, FaFont, FaCog } from "react-icons/fa";

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: {
      primaryColor: "#FFD60A",
      secondaryColor: "#000814",
      accentColor: "#585D69"
    },
    typography: {
      primaryFont: "Inter",
      fontSize: "16px",
      headingScale: "1.2"
    },
    layout: {
      sidebarWidth: "250px",
      contentMaxWidth: "1200px",
      headerHeight: "60px"
    }
  });

  const [activeTab, setActiveTab] = useState("theme");

  const handleThemeChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  const handleTypographyChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value
      }
    }));
  };

  const handleLayoutChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    // You can also implement API call to save settings in backend
  };

  return (
    <div className="text-richblack-5">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-semibold">System Settings</h4>
        <button
          onClick={handleSave}
          className="bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("theme")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "theme"
              ? "bg-yellow-50 text-richblack-900"
              : "bg-richblack-700 text-richblack-50"
          }`}
        >
          <FaPalette />
          <span>Theme</span>
        </button>
        <button
          onClick={() => setActiveTab("typography")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "typography"
              ? "bg-yellow-50 text-richblack-900"
              : "bg-richblack-700 text-richblack-50"
          }`}
        >
          <FaFont />
          <span>Typography</span>
        </button>
        <button
          onClick={() => setActiveTab("layout")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            activeTab === "layout"
              ? "bg-yellow-50 text-richblack-900"
              : "bg-richblack-700 text-richblack-50"
          }`}
        >
          <FaCog />
          <span>Layout</span>
        </button>
      </div>

      {/* Settings Content */}
      <div className="bg-richblack-800 p-6 rounded-lg">
        {activeTab === "theme" && (
          <div className="space-y-6">
            <h5 className="text-xl font-semibold mb-4">Theme Settings</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.theme.primaryColor}
                    onChange={(e) => handleThemeChange("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span>{settings.theme.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.theme.secondaryColor}
                    onChange={(e) => handleThemeChange("secondaryColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span>{settings.theme.secondaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Accent Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.theme.accentColor}
                    onChange={(e) => handleThemeChange("accentColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span>{settings.theme.accentColor}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "typography" && (
          <div className="space-y-6">
            <h5 className="text-xl font-semibold mb-4">Typography Settings</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Primary Font</label>
                <select
                  value={settings.typography.primaryFont}
                  onChange={(e) => handleTypographyChange("primaryFont", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Base Font Size</label>
                <select
                  value={settings.typography.fontSize}
                  onChange={(e) => handleTypographyChange("fontSize", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                >
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Heading Scale</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="2"
                  value={settings.typography.headingScale}
                  onChange={(e) => handleTypographyChange("headingScale", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "layout" && (
          <div className="space-y-6">
            <h5 className="text-xl font-semibold mb-4">Layout Settings</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Sidebar Width</label>
                <input
                  type="text"
                  value={settings.layout.sidebarWidth}
                  onChange={(e) => handleLayoutChange("sidebarWidth", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Content Max Width</label>
                <input
                  type="text"
                  value={settings.layout.contentMaxWidth}
                  onChange={(e) => handleLayoutChange("contentMaxWidth", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Header Height</label>
                <input
                  type="text"
                  value={settings.layout.headerHeight}
                  onChange={(e) => handleLayoutChange("headerHeight", e.target.value)}
                  className="w-full bg-richblack-700 rounded-lg p-3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        <div className="mt-8 p-4 border border-richblack-600 rounded-lg">
          <h6 className="text-sm font-semibold mb-4">Preview</h6>
          <div 
            className="p-4 rounded-lg"
            style={{ 
              backgroundColor: settings.theme.secondaryColor,
              color: settings.theme.primaryColor,
              fontFamily: settings.typography.primaryFont,
              fontSize: settings.typography.fontSize
            }}
          >
            <h3 style={{ fontSize: `calc(${settings.typography.fontSize} * ${settings.typography.headingScale})`}}>
              Sample Heading
            </h3>
            <p className="mt-2">
              This is a preview of how your content will look with the current settings.
            </p>
            <button
              className="mt-4 px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: settings.theme.primaryColor,
                color: settings.theme.secondaryColor
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
