import { useState, useEffect, useCallback } from 'react'
import '../styles.css'

function App() {
  const [postits, setPostits] = useState([])
  const [selectedColor, setSelectedColor] = useState('#D6A99D')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragElement, setDragElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isOverTrash, setIsOverTrash] = useState(false)
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
        // Ensure all post-its have required properties for backward compatibility
        const normalizedData = parsedData.map(postit => ({
          ...postit,
          rotation: postit.rotation || (Math.random() - 0.5) * 8,
          position: postit.position || { x: 0, y: 0 }
        }))
        setPostits(normalizedData)
        console.log('📂 Dados carregados:', normalizedData.length, 'post-its')
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
      rotation: (Math.random() - 0.5) * 8, // Random rotation between -4 and 4 degrees
      position: { x: 0, y: 0 } // Initial position will be set by CSS grid
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

  // Calculate date status
  const getDateStatus = (dateString) => {
    if (!dateString) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(dateString)
    targetDate.setHours(0, 0, 0, 0)
    
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'overdue'
    if (diffDays === 0) return 'due-today'
    if (diffDays <= 2) return 'due-soon'
    if (diffDays <= 7) return 'approaching'
    
    return null
  }

  // Validation  
  const isFormValid = description.trim().length > 0 && description.length <= 120

  // Handle form submission
  const handleFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    
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


  // Update post-it position
  const updatePostitPosition = useCallback((id, newPosition) => {
    const newPostits = postits.map(p => 
      p.id === id ? { ...p, position: newPosition } : p
    )
    setPostits(newPostits)
    saveToStorage(newPostits)
  }, [postits])

  // Drag handlers
  const handleDragStart = (e, id) => {
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    
    setIsDragging(true)
    setDragElement(id)
    setDragStart({ x: clientX, y: clientY })
    setDragOffset({ x: 0, y: 0 })
    e.preventDefault()
  }

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !dragElement) return
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    
    const newOffset = {
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    }
    
    // Check if over trash zone (bottom-left corner)
    const trashZone = {
      x: 0,
      y: window.innerHeight - 120,
      width: 120,
      height: 120
    }
    
    const isInTrashZone = clientX >= trashZone.x && clientX <= trashZone.x + trashZone.width &&
                         clientY >= trashZone.y && clientY <= trashZone.y + trashZone.height
    
    setIsOverTrash(isInTrashZone)
    setDragOffset(newOffset)
    e.preventDefault()
  }, [isDragging, dragElement, dragStart])

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !dragElement) return
    
    const currentPostit = postits.find(p => p.id === dragElement)
    if (!currentPostit) return
    
    if (isOverTrash) {
      // Delete the post-it with animation
      setTimeout(() => {
        deletePostit(dragElement)
      }, 200)
    } else {
      // Update position
      const element = document.querySelector(`[data-postit-id="${dragElement}"]`)
      const currentPosition = currentPostit.position || { x: 0, y: 0 }
      
      let initialX = currentPosition.x
      let initialY = currentPosition.y
      
      // If this is the first time moving this post-it, get its current position from the DOM
      if (currentPosition.x === 0 && currentPosition.y === 0 && element) {
        const rect = element.getBoundingClientRect()
        initialX = rect.left
        initialY = rect.top
      }
      
      const finalX = initialX + dragOffset.x
      const finalY = initialY + dragOffset.y
      
      updatePostitPosition(dragElement, {
        x: finalX,
        y: finalY
      })
    }
    
    setIsDragging(false)
    setDragElement(null)
    setDragOffset({ x: 0, y: 0 })
    setDragStart({ x: 0, y: 0 })
    setIsOverTrash(false)
  }, [isDragging, dragElement, dragOffset, postits, updatePostitPosition, deletePostit, isOverTrash])

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
        <div className="postits-container">
          <div className="postits-grid">
            {postits.map(postit => {
              const isDraggedElement = dragElement === postit.id
              const baseRotation = postit.rotation || 0
              const currentPosition = postit.position || { x: 0, y: 0 }
              const dateStatus = getDateStatus(postit.date)
              
              let transform = `rotate(${baseRotation}deg)`
              const hasBeenMoved = currentPosition.x !== 0 || currentPosition.y !== 0
              
              let style = {
                backgroundColor: postit.color,
                transform,
                position: hasBeenMoved ? 'fixed' : 'relative', // Use fixed for full screen positioning
                left: hasBeenMoved ? `${currentPosition.x}px` : 'auto',
                top: hasBeenMoved ? `${currentPosition.y}px` : 'auto',
                zIndex: isDraggedElement ? 1000 : (hasBeenMoved ? 2 : 1)
              }
              
              if (isDraggedElement && isDragging) {
                // Apply drag transform with trash preview
                const scaleValue = isOverTrash ? 0.7 : 1.05
                const rotationValue = baseRotation + (isOverTrash ? 15 : 5)
                
                transform = `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotationValue}deg) scale(${scaleValue})`
                style = {
                  ...style,
                  transform,
                  transition: 'none',
                  zIndex: 1000,
                  cursor: 'grabbing',
                  opacity: isOverTrash ? 0.5 : 1,
                  filter: isOverTrash ? 'brightness(0.7) saturate(0.5)' : 'none'
                }
              } else if (hasBeenMoved) {
                style.transition = 'all 0.3s ease'
              }
              
              return (
                <div
                  key={postit.id}
                  data-postit-id={postit.id}
                  className={`postit ${isDraggedElement && isDragging ? 'dragging' : ''}`}
                  style={style}
                  onMouseDown={(e) => handleDragStart(e, postit.id)}
                  onTouchStart={(e) => handleDragStart(e, postit.id)}
                >
                  {/* Date Status Badge */}
                  {dateStatus && (
                    <div className={`date-badge ${dateStatus}`}>
                      {dateStatus === 'approaching' && <div className="badge-dot"></div>}
                      {dateStatus === 'due-soon' && <div className="badge-icon warning">!</div>}
                      {dateStatus === 'due-today' && <div className="badge-icon today">●</div>}
                      {dateStatus === 'overdue' && <div className="badge-icon overdue">×</div>}
                    </div>
                  )}
                  
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

      {/* Trash Zone */}
      {isDragging && (
        <div className={`trash-zone ${isOverTrash ? 'active' : ''}`}>
          <div className="trash-icon">🗑️</div>
          <div className="trash-text">Solte para excluir</div>
        </div>
      )}

      {/* FAB Button */}
      <button className="fab" onClick={() => setIsModalOpen(true)}>
        <span className="fab-icon">+</span>
      </button>

      {/* Modal Post-it Interativo */}
      {isModalOpen && (
        <div className="modal show">
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="modal-postit-editor">
            <button 
              className="modal-close-btn" 
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>

            {/* Post-it Preview */}
            <div 
              className="postit postit-editor"
              style={{ 
                backgroundColor: selectedColor,
                transform: 'rotate(-2deg) scale(1.1)'
              }}
            >
              {/* Área de texto editável */}
              <div className="postit-content">
                <textarea
                  className="postit-textarea"
                  placeholder="Digite sua nota aqui..."
                  value={description}
                  onChange={handleDescriptionChange}
                  maxLength="120"
                  autoFocus
                />
                
                {/* Data no canto */}
                {date && (
                  <div className="postit-date">{formatDate(date)}</div>
                )}
              </div>
            </div>

            {/* Controles */}
            <div className="postit-controls">
              {/* Contador de caracteres */}
              <div className="char-counter-editor">
                <span className={description.length > 100 ? 'warning' : ''}>
                  {description.length}/120
                </span>
              </div>

              {/* Seletor de data */}
              <div className="date-control">
                <label>📅 Data (opcional)</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              {/* Seletor de cor */}
              <div className="color-control">
                <label>🎨 Cor do Post-it</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  disabled={!isFormValid}
                  onClick={handleFormSubmit}
                >
                  📌 Colar no Quadro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App