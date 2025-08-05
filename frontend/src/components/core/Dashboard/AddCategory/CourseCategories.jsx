import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import * as Icons from 'react-icons/fa'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTags, FaEye, FaChartBar } from 'react-icons/fa'
import IconBtn from '../../../common/IconBtn'
import ConfirmationModal from '../../../common/ConfirmationModal'
import { createCategory, updateCategory, deleteCategory } from '../../../../services/operations/categoryAPI'
import { fetchCourseCategories } from '../../../../services/operations/courseDetailsAPI'

export default function CourseCategories() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('FaBook')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Popular icons for categories
  const availableIcons = [
    'FaBook', 'FaCode', 'FaDesktop', 'FaPaintBrush', 'FaCamera', 'FaMusic',
    'FaCalculator', 'FaFlask', 'FaGraduationCap', 'FaLanguage', 'FaChartBar',
    'FaRocket', 'FaLightbulb', 'FaHeart', 'FaGamepad', 'FaCog', 'FaDatabase',
    'FaMobile', 'FaCloud', 'FaShield', 'FaUsers', 'FaBriefcase', 'FaGlobe',
    'FaAtom', 'FaDna', 'FaMicroscope', 'FaTheaterMasks', 'FaFilm', 'FaPalette',
    // Additional technical and education-related icons
    'FaLaptopCode', 'FaServer', 'FaNetworkWired', 'FaRobot', 'FaBrain',
    'FaChalkboardTeacher', 'FaBookReader', 'FaCertificate', 'FaAward', 'FaMedal',
    'FaProjectDiagram', 'FaSitemap', 'FaCodeBranch', 'FaTerminal', 'FaKeyboard',
    'FaMicrochip', 'FaMemory', 'FaHdd', 'FaWifi', 'FaBluetooth',
    'FaAndroid', 'FaApple', 'FaLinux', 'FaWindows', 'FaUbuntu',
    'FaReact', 'FaNodeJs', 'FaPython', 'FaJava', 'FaJs',
    'FaHtml5', 'FaCss3Alt', 'FaBootstrap', 'FaSass', 'FaVuejs',
    'FaAngular', 'FaPhp', 'FaLaravel', 'FaWordpress', 'FaDrupal',
    'FaGitAlt', 'FaGithub', 'FaBitbucket', 'FaDocker', 'FaAws',
    'FaDigitalOcean', 'FaSlack', 'FaTrello', 'FaJira', 'FaConfluence',
    'FaChartLine', 'FaChartPie', 'FaTable', 'FaFileExcel', 'FaFilePowerpoint',
    'FaSearch', 'FaSearchPlus', 'FaEye', 'FaBug', 'FaTools',
    'FaCubes', 'FaLayerGroup', 'FaObjectGroup', 'FaVectorSquare', 'FaDrawPolygon',
    // More technical and education icons
    'FaSchool', 'FaUniversity', 'FaBlackboard', 'FaPencilAlt', 'FaEraser',
    'FaRuler', 'FaVial', 'FaWeight',
    'FaBalanceScale', 'FaThermometerHalf', 'FaMagnet', 'FaBolt', 'FaFire',
    'FaLeaf', 'FaSeedling', 'FaTree', 'FaRecycle', 'FaSolarPanel',
    'FaIndustry', 'FaFactory', 'FaCogs', 'FaWrench', 'FaHammer',
    'FaScrewdriver', 'FaToolbox', 'FaHardHat', 'FaClipboardList', 'FaClipboardCheck',
    'FaFileCode', 'FaFileAlt', 'FaFilePdf', 'FaFileWord', 'FaFileImage',
    'FaFolder', 'FaFolderOpen', 'FaArchive', 'FaBox', 'FaBoxes',
    'FaLock', 'FaUnlock', 'FaKey', 'FaFingerprint', 'FaUserShield',
    'FaShieldAlt', 'FaLockOpen', 'FaUserLock', 'FaIdCard', 'FaIdBadge',
    'FaWallet', 'FaCreditCard', 'FaCoins', 'FaDollarSign', 'FaChartArea',
    'FaTrendingUp', 'FaTrendingDown', 'FaPercentage', 'FaEquals', 'FaDivide',
    'FaTimes', 'FaPlus', 'FaMinus', 'FaInfinity', 'FaSquareRootAlt',
    'FaSuperscript', 'FaSubscript', 'FaFunction', 'FaVariable', 'FaIntegral',
    'FaWaveSquare', 'FaSignal', 'FaBroadcastTower', 'FaSatellite', 'FaRadio',
    'FaMicrophone', 'FaHeadphones', 'FaVolumeUp', 'FaVolumeDown', 'FaVolumeMute',
    'FaPlay', 'FaPause', 'FaStop', 'FaForward', 'FaBackward',
    'FaStepForward', 'FaStepBackward', 'FaRandom', 'FaRepeat', 'FaExchangeAlt',
    'FaSync', 'FaSyncAlt', 'FaRedo', 'FaUndo', 'FaHistory',
    'FaClock', 'FaStopwatch', 'FaHourglass', 'FaCalendar', 'FaCalendarAlt',
    'FaMapMarkedAlt', 'FaMap', 'FaGlobeAmericas', 'FaGlobeAsia', 'FaGlobeEurope',
    'FaCompass', 'FaRoute', 'FaRoad', 'FaDirections', 'FaLocationArrow',
    // Additional specialized icons
    'FaStethoscope', 'FaHeartbeat', 'FaPills', 'FaSyringe', 'FaBandAid',
    'FaXRay', 'FaUserMd', 'FaHospital', 'FaAmbulance', 'FaFirstAid',
    'FaGavel', 'FaBalanceScaleLeft', 'FaBalanceScaleRight', 'FaHandshake', 'FaFileContract',
    'FaNewspaper', 'FaBullhorn', 'FaMegaphone', 'FaBroadcast', 'FaPodcast',
    'FaVideo', 'FaVideoSlash', 'FaCameraRetro', 'FaPhotoVideo', 'FaImages',
    'FaImage', 'FaPortrait', 'FaFileVideo', 'FaFileAudio',
    'FaGuitar', 'FaDrum', 'FaPiano', 'FaRecordVinyl',
    'FaCompactDisc', 'FaHeadphonesAlt', 'FaSpeaker', 'FaVolumeOff',
    'FaGamepad', 'FaDice', 'FaDiceOne', 'FaDiceTwo', 'FaDiceThree',
    'FaDiceFour', 'FaDiceFive', 'FaDiceSix', 'FaChess', 'FaChessBoard',
    'FaRunning', 'FaWalking', 'FaBiking', 'FaSwimmer', 'FaDumbbell',
    'FaFootballBall', 'FaBasketballBall', 'FaBaseballBall', 'FaTennisball', 'FaVolleyballBall',
    'FaCar', 'FaTruck', 'FaBus', 'FaTrain', 'FaPlane',
    'FaShip', 'FaMotorcycle', 'FaBicycle', 'FaHelicopter', 'FaRocket',
    'FaSpaceShuttle', 'FaSatelliteDish', 'FaTv', 'FaTabletAlt', 'FaMobileAlt',
    'FaLaptop', 'FaKeyboard', 'FaMouse', 'FaPrint', 'FaFax',
    'FaPhone', 'FaPhoneAlt', 'FaEnvelope', 'FaEnvelopeOpen', 'FaMailBulk',
    'FaAddressBook', 'FaAddressCard', 'FaBusinessTime', 'FaHandHoldingUsd', 'FaMoneyBill',
    'FaMoneyBillAlt', 'FaMoneyCheck', 'FaMoneyCheckAlt', 'FaPiggyBank', 'FaReceipt'
  ]

  // Fetch existing categories
  const loadCategories = async () => {
    setCategoriesLoading(true)
    try {
      const result = await fetchCourseCategories()
      setCategories(result || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    
    const categoryData = {
      name: data.categoryName,
      description: data.categoryDescription,
      icon: selectedIcon
    }
    
    let result
    if (editingCategory) {
      // Update existing category
      categoryData.categoryId = editingCategory._id
      result = await updateCategory(categoryData, token)
    } else {
      // Create new category
      result = await createCategory(categoryData, token)
    }
    
    if (result) {
      reset()
      setSelectedIcon('FaBook')
      setShowCreateForm(false)
      setShowIconPicker(false)
      setEditingCategory(null)
      // Reload categories to show the updated list
      loadCategories()
    }
    
    setLoading(false)
  }

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName]
    return IconComponent ? <IconComponent className="w-6 h-6 text-white" /> : <Icons.FaBook className="w-6 h-6 text-white" />
  }

  const handleReset = () => {
    reset()
    setSelectedIcon('FaBook')
    setShowIconPicker(false)
  }

  const handleCreateNew = () => {
    setEditingCategory(null)
    setShowCreateForm(true)
    handleReset()
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingCategory(null)
    handleReset()
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowCreateForm(true)
    setSelectedIcon(category.icon || 'FaBook')
    reset({
      categoryName: category.name,
      categoryDescription: category.description
    })
  }

  const handleDelete = async (categoryId) => {
    const result = await deleteCategory(categoryId, token)
    if (result) {
      setConfirmationModal(null)
      // Reload categories to show the updated list
      loadCategories()
    }
  }

  useEffect(() => {
    if (editingCategory) {
      setSelectedIcon(editingCategory.icon || 'FaBook')
    }
  }, [editingCategory])

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-medium text-richblack-5">
            Course Categories
          </h1>
          {!showCreateForm && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 rounded-md bg-yellow-50 px-5 py-2 text-richblack-900 hover:bg-yellow-100 transition-all duration-200 font-medium"
            >
              <FaPlus className="text-lg" />
              Create Category
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-richblack-800 rounded-xl p-4 flex items-center justify-between border border-richblack-700">
            <div>
              <p className="text-sm text-richblack-300">Total Categories</p>
              <p className="text-2xl font-bold text-richblack-5">{categories.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <FaTags className="text-2xl text-richblack-900" />
            </div>
          </div>
          <div className="bg-richblack-800 rounded-xl p-4 flex items-center justify-between border border-richblack-700">
            <div>
              <p className="text-sm text-richblack-300">Active Categories</p>
              <p className="text-2xl font-bold text-richblack-5">
                {categories.filter(cat => cat.courses?.length > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center">
              <FaEye className="text-2xl text-white" />
            </div>
          </div>
          <div className="bg-richblack-800 rounded-xl p-4 flex items-center justify-between border border-richblack-700">
            <div>
              <p className="text-sm text-richblack-300">Average Courses</p>
              <p className="text-2xl font-bold text-richblack-5">
                {categories.length > 0 
                  ? Math.round(categories.reduce((acc, cat) => acc + (cat.courses?.length || 0), 0) / categories.length)
                  : 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
              <FaChartBar className="text-2xl text-white" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {!showCreateForm && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-richblack-700 rounded-lg pl-12 pr-4 py-3 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-richblack-400"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-richblack-400" />
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 rounded-xl border border-richblack-700 bg-richblack-800 p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-richblack-5">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-richblack-300 hover:text-pink-200 transition-colors rounded-lg hover:bg-richblack-700"
              title="Close Form"
            >
              <Icons.FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid gap-6">
            {/* Category Name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="categoryName" className="text-sm text-richblack-5">
                Category Name <sup className="text-pink-200">*</sup>
              </label>
              <input
                id="categoryName"
                placeholder="Enter category name"
                {...register("categoryName", { required: true })}
                className="w-full bg-richblack-700 rounded-lg px-4 py-3 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
              />
              {errors.categoryName && (
                <span className="text-xs tracking-wide text-pink-200">
                  Category name is required
                </span>
              )}
            </div>

            {/* Category Description */}
            <div className="flex flex-col gap-2">
              <label htmlFor="categoryDescription" className="text-sm text-richblack-5">
                Category Description <sup className="text-pink-200">*</sup>
              </label>
              <textarea
                id="categoryDescription"
                placeholder="Enter category description"
                {...register("categoryDescription", { required: true })}
                className="w-full bg-richblack-700 rounded-lg px-4 py-3 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50 min-h-[130px] resize-none"
              />
              {errors.categoryDescription && (
                <span className="text-xs tracking-wide text-pink-200">
                  Category description is required
                </span>
              )}
            </div>

            {/* Icon Picker */}
            <div className="flex flex-col gap-4">
              <label className="text-sm text-richblack-5">
                Category Icon <sup className="text-pink-200">*</sup>
              </label>
              
              {/* Selected Icon Display */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 bg-richblack-700 rounded-xl border border-richblack-600">
                  {renderIcon(selectedIcon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-richblack-300">Selected Icon</p>
                  <p className="text-richblack-5">{selectedIcon}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="px-4 py-2 bg-richblack-700 text-yellow-50 rounded-lg hover:bg-richblack-600 transition-all duration-200 border border-yellow-50"
                >
                  {showIconPicker ? 'Hide Icons' : 'Choose Icon'}
                </button>
              </div>

              {/* Icon Picker Grid */}
              {showIconPicker && (
                <div className="grid grid-cols-8 gap-3 p-4 bg-richblack-700 rounded-xl border border-richblack-600 max-h-64 overflow-y-auto">
                  {availableIcons.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(iconName)
                        setShowIconPicker(false)
                      }}
                      className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all hover:scale-110 ${
                        selectedIcon === iconName
                          ? 'border-yellow-50 bg-yellow-50 text-richblack-900'
                          : 'border-richblack-600 bg-richblack-800 text-richblack-5 hover:border-yellow-50'
                      }`}
                      title={iconName}
                    >
                      {renderIcon(iconName)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 py-3 text-richblack-300 rounded-lg hover:bg-richblack-700 hover:text-yellow-50 border border-richblack-600 transition-all duration-200"
              >
                Reset
              </button>
              <IconBtn
                disabled={loading}
                text={loading ? (editingCategory ? "Updating..." : "Creating...") : (editingCategory ? "Update Category" : "Create Category")}
                customClasses="flex-[2]"
                type="submit"
              />
            </div>
          </div>
        </form>
      )}

      {/* Existing Categories List */}
      {!showCreateForm && (
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-richblack-5">Categories ({filteredCategories.length})</h2>
          </div>
          
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-yellow-50"/>
              <span className="ml-2 text-richblack-200">Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-richblack-200">
              <Icons.FaBook className="text-5xl mb-4 text-richblack-400" />
              <p className="text-lg font-medium">No categories found</p>
              <p className="text-sm text-richblack-300">
                {searchTerm ? 'Try adjusting your search' : 'Create your first category to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className="group flex flex-col gap-3 p-5 bg-richblack-700 rounded-xl border border-richblack-600 hover:border-yellow-50 hover:bg-richblack-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-richblack-800 rounded-xl border border-richblack-600 group-hover:border-yellow-50 transition-all duration-200">
                        {category.icon ? renderIcon(category.icon) : <Icons.FaBook className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-richblack-5">
                          {category.name}
                        </h3>
                        <p className="text-xs text-richblack-300">
                          {category.courses?.length || 0} Courses
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-richblack-300 hover:text-yellow-50 transition-colors rounded-lg hover:bg-richblack-700"
                        title="Edit Category"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setConfirmationModal({
                            text1: "Delete Category?",
                            text2: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
                            btn1Text: "Delete",
                            btn2Text: "Cancel",
                            btn1Handler: () => handleDelete(category._id),
                            btn2Handler: () => setConfirmationModal(null),
                          })
                        }}
                        className="p-2 text-richblack-300 hover:text-pink-200 transition-colors rounded-lg hover:bg-richblack-700"
                        title="Delete Category"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-richblack-300 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  )
}
