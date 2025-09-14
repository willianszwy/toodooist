import { useState, useEffect, useCallback } from 'react'
import '../styles.css'

function App() {
  const [postits, setPostits] = useState([])
  const [selectedColor, setSelectedColor] = useState('#D6A99D')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragElement, setDragElement] = useState(null)
  const [dragCurrentX, setDragCurrentX] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  // Colors available
  const colors = [
    '#D6A99D',
    '#FBF3D5',
    '#D6DAC8',
    '#ADB2D4',
    '#C7D9DD',
    '#D5E5D5',
    '#EEF1DA'
  ]

  // Load from localStorage on component mount
  useEffect(() => {
    console.log('🚀 Toodooist iniciado')
    loadFromStorage()
  }, [])

  // LocalStorage functions
  const saveToStorage = (data) => {
    try {
      localStorage.setItem('toodooist_data', JSON.stringify(data))
      console.log('💾 Dados salvos:', data.length, 'post-its')
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error)
      return false
    }
  }

  const loadFromStorage = () => {
    try {
      const data = localStorage.getItem('toodooist_data')
      if (data) {
        const parsedData = JSON.parse(data)
        setPostits(parsedData)
        console.log('📂 Dados carregados:', parsedData.length, 'post-its')
      }
      console.log('✅ localStorage funcionando:', !!data)
      return true
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error)
      setPostits([])
      return false
    }
  }

  // Create post-it function
  const createPostit = (description, date, color) => {
    const postit = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      description: description.trim(),
      date: date || null,
      color: color,
      createdAt: new Date().toISOString(),
      rotation: (Math.random() - 0.5) * 8 // Random rotation between -4 and 4 degrees
    }
    
    const newPostits = [...postits, postit]
    setPostits(newPostits)
    saveToStorage(newPostits)
    console.log('✅ Post-it criado e salvo:', postit)
    
    return postit
  }

  // Delete post-it function
  const deletePostit = useCallback((id) => {
    const newPostits = postits.filter(p => p.id !== id)
    setPostits(newPostits)
    saveToStorage(newPostits)
    console.log('🗑️ Post-it excluído:', id)
  }, [postits])

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `📅 ${day}/${month}/${year}`
  }

  // Validation
  const isFormValid = description.trim().length > 0 && description.length <= 40

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (isFormValid) {
      createPostit(description.trim(), date || null, selectedColor)
      setIsModalOpen(false)
      resetForm()
    }
  }

  // Reset form
  const resetForm = () => {
    setDescription('')
    setDate('')
    setSelectedColor('#D6A99D')
  }

  // Handle description change
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
  }

  // Handle date change
  const handleDateChange = (e) => {
    setDate(e.target.value)
  }


  // Drag handlers
  const handleDragStart = (e, id) => {
    if (e.target.closest('.postit-content')) {
      setIsDragging(true)
      setDragStartX(e.clientX || e.touches?.[0]?.clientX || 0)
      setDragElement(id)
      setDragCurrentX(0)
      e.preventDefault()
    }
  }

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !dragElement) return
    
    const currentX = (e.clientX || e.touches?.[0]?.clientX || 0) - dragStartX
    const newCurrentX = Math.max(0, currentX)
    setDragCurrentX(newCurrentX)
    e.preventDefault()
  }, [isDragging, dragElement, dragStartX])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !dragElement) return
    
    const shouldDelete = dragCurrentX > 150
    
    if (shouldDelete) {
      setTimeout(() => {
        deletePostit(dragElement)
      }, 300)
    }
    
    setIsDragging(false)
    setDragElement(null)
    setDragCurrentX(0)
    setDragStartX(0)
  }, [isDragging, dragElement, dragCurrentX, deletePostit])

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleDragMove(e)
      const handleMouseUp = () => handleDragEnd()
      const handleTouchMove = (e) => handleDragMove(e)
      const handleTouchEnd = () => handleDragEnd()
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleDragEnd, handleDragMove])

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="brand">
            <h1 className="brand-title">Toodooist</h1>
            <p className="brand-subtitle">"Dalek: But you have no weapons, no defenses, no plan"</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <div className="postits-grid">
            {postits.map(postit => {
              const isDraggedElement = dragElement === postit.id
              const progress = isDraggedElement ? Math.min(dragCurrentX / 150, 1) : 0
              const dragRotation = progress * 15
              const opacity = 1 - (progress * 0.7)
              const baseRotation = postit.rotation || 0
              
              return (
                <div
                  key={postit.id}
                  className={`postit ${isDraggedElement && isDragging ? 'dragging' : ''}`}
                  style={isDraggedElement ? {
                    transform: `translateX(${dragCurrentX}px) rotate(${baseRotation + dragRotation}deg)`,
                    opacity: dragCurrentX > 150 ? 0 : opacity,
                    transition: !isDragging && dragCurrentX > 150 ? 'all 0.3s ease-out' : 'none',
                    backgroundColor: postit.color
                  } : {
                    transform: `rotate(${baseRotation}deg)`,
                    backgroundColor: postit.color
                  }}
                  onMouseDown={(e) => handleDragStart(e, postit.id)}
                  onTouchStart={(e) => handleDragStart(e, postit.id)}
                >
                  <div className="postit-content">
                    <div className="postit-description">{postit.description}</div>
                    {postit.date && (
                      <div className="postit-date">{formatDate(postit.date)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {postits.length === 0 && (
            <div className="empty-state show">
              <div className="empty-icon">📝</div>
              <h2>Nenhum post-it criado ainda</h2>
              <p>Clique no botão + para criar seu primeiro post-it</p>
            </div>
          )}
        </div>
      </main>

      {/* FAB Button */}
      <button className="fab" onClick={() => setIsModalOpen(true)}>
        <span className="fab-icon">+</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal show">
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Novo Post-it</h2>
              <button 
                className="modal-close" 
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            
            <form className="modal-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="description">Descrição *</label>
                <textarea 
                  id="description" 
                  name="description" 
                  placeholder="Digite a descrição do seu post-it..."
                  maxLength="40"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                />
                <div className="char-counter">
                  <span>{description.length}</span>/40
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Data (opcional)</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              <div className="form-group">
                <label>Cor</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!isFormValid}
                >
                  Criar Post-it
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App