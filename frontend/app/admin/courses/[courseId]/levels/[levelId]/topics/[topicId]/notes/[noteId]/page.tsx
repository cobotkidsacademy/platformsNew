"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import { Note, NoteElement } from "../../../../../../../types";

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  isResizing: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const levelId = params.levelId as string;
  const topicId = params.topicId as string;
  const noteId = params.noteId as string;

  const canvasRef = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [elements, setElements] = useState<NoteElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    elementId: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/courses/notes/${noteId}`);
      setNote(response.data);
      setElements(response.data.note_elements || []);
    } catch (err) {
      console.error("Error fetching note:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  // Add new element
  const addElement = async (type: 'text' | 'image') => {
    try {
      const response = await apiClient.post("/courses/notes/elements", {
        note_id: noteId,
        element_type: type,
        content: type === 'text' ? 'Double-click to edit' : '',
        position_x: 50,
        position_y: 50 + (elements.length * 20),
        width: type === 'text' ? 300 : 200,
        height: type === 'text' ? 100 : 150,
      });
      setElements([...elements, response.data]);
      setSelectedId(response.data.id);
    } catch (err) {
      console.error("Error adding element:", err);
    }
  };

  // Update element position
  const updateElementPosition = async (id: string, x: number, y: number) => {
    try {
      await apiClient.put(`/courses/notes/elements/${id}`, {
        position_x: Math.max(0, x),
        position_y: Math.max(0, y),
      });
    } catch (err) {
      console.error("Error updating position:", err);
    }
  };

  // Update element content
  const updateElementContent = async (id: string, content: string) => {
    try {
      await apiClient.put(`/courses/notes/elements/${id}`, { content });
      setElements(elements.map(el => el.id === id ? { ...el, content } : el));
    } catch (err) {
      console.error("Error updating content:", err);
    }
  };

  // Update element size
  const updateElementSize = async (id: string, width: number, height: number) => {
    try {
      await apiClient.put(`/courses/notes/elements/${id}`, { width, height });
    } catch (err) {
      console.error("Error updating size:", err);
    }
  };

  // Update element font styling
  const updateElementStyling = async (id: string, updates: {
    font_size?: number;
    font_family?: string;
    font_color?: string;
    font_weight?: string;
  }) => {
    try {
      await apiClient.put(`/courses/notes/elements/${id}`, updates);
      setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
    } catch (err) {
      console.error("Error updating styling:", err);
    }
  };

  // Delete element
  const deleteElement = async (id: string) => {
    try {
      await apiClient.delete(`/courses/notes/elements/${id}`);
      setElements(elements.filter(el => el.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error("Error deleting element:", err);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (editingId) return;
    e.preventDefault();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setSelectedId(elementId);
    setDragState({
      isDragging: true,
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: element.position_x,
      offsetY: element.position_y,
    });

    // Bring to front
    const maxZ = Math.max(...elements.map(el => el.z_index || 0));
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, z_index: maxZ + 1 } : el
    ));
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging && dragState.elementId) {
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      const newX = Math.max(0, dragState.offsetX + deltaX);
      const newY = Math.max(0, dragState.offsetY + deltaY);

      setElements(prev => prev.map(el => 
        el.id === dragState.elementId 
          ? { ...el, position_x: newX, position_y: newY }
          : el
      ));
    }

    if (resizeState.isResizing && resizeState.elementId) {
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;
      const newWidth = Math.max(100, resizeState.startWidth + deltaX);
      const newHeight = Math.max(50, resizeState.startHeight + deltaY);

      setElements(prev => prev.map(el => 
        el.id === resizeState.elementId 
          ? { ...el, width: newWidth, height: newHeight }
          : el
      ));
    }
  }, [dragState, resizeState]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.elementId) {
      const element = elements.find(el => el.id === dragState.elementId);
      if (element) {
        updateElementPosition(element.id, element.position_x, element.position_y);
      }
    }

    if (resizeState.isResizing && resizeState.elementId) {
      const element = elements.find(el => el.id === resizeState.elementId);
      if (element) {
        updateElementSize(element.id, element.width, element.height);
      }
    }

    setDragState({ isDragging: false, elementId: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
    setResizeState({ isResizing: false, elementId: null, startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  }, [dragState, resizeState, elements]);

  useEffect(() => {
    if (dragState.isDragging || resizeState.isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, resizeState.isResizing, handleMouseMove, handleMouseUp]);

  // Resize handler
  const handleResizeStart = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    setResizeState({
      isResizing: true,
      elementId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width,
      startHeight: element.height,
    });
  };

  // Double click to edit
  const handleDoubleClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element?.element_type === 'text') {
      setEditingId(elementId);
    }
  };

  // Click on canvas to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
      setEditingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/courses/${courseId}/levels/${levelId}/topics/${topicId}`)}
            className="p-2 hover:bg-[var(--accent)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">{note?.title || "Note"}</h1>
            <p className="text-sm text-[var(--muted)]">Drag elements to position • Double-click text to edit</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Element Toolbar */}
          <div className="flex items-center gap-2 bg-[var(--background)] rounded-xl p-2 border border-[var(--border)]">
            <button
              onClick={() => addElement('text')}
              className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-500 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              Add Text
            </button>
            <button
              onClick={() => addElement('image')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add Image
            </button>
          </div>

          {/* Font Styling Toolbar - Only show when a text element is selected */}
          {selectedId && elements.find(el => el.id === selectedId)?.element_type === 'text' && (
            <div className="flex items-center gap-2 bg-[var(--background)] rounded-xl p-2 border border-[var(--border)]">
              {/* Font Family */}
              <select
                value={elements.find(el => el.id === selectedId)?.font_family || 'Inter'}
                onChange={(e) => updateElementStyling(selectedId, { font_family: e.target.value })}
                className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] cursor-pointer hover:border-violet-500/50 transition-colors"
              >
                <option value="Inter">Inter</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Courier New">Courier New</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Palatino Linotype">Palatino</option>
              </select>

              {/* Font Size */}
              <select
                value={elements.find(el => el.id === selectedId)?.font_size || 16}
                onChange={(e) => updateElementStyling(selectedId, { font_size: parseInt(e.target.value) })}
                className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] cursor-pointer hover:border-violet-500/50 transition-colors"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
                <option value={24}>24px</option>
                <option value={28}>28px</option>
                <option value={32}>32px</option>
                <option value={36}>36px</option>
                <option value={42}>42px</option>
                <option value={48}>48px</option>
                <option value={56}>56px</option>
                <option value={64}>64px</option>
              </select>

              {/* Bold Toggle */}
              <button
                onClick={() => {
                  const currentWeight = elements.find(el => el.id === selectedId)?.font_weight || 'normal';
                  updateElementStyling(selectedId, { font_weight: currentWeight === 'bold' ? 'normal' : 'bold' });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  elements.find(el => el.id === selectedId)?.font_weight === 'bold'
                    ? 'bg-violet-500 text-white'
                    : 'bg-[var(--card)] hover:bg-[var(--accent)] text-[var(--foreground)]'
                }`}
                title="Bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                </svg>
              </button>

              {/* Font Color */}
              <div className="relative">
                <input
                  type="color"
                  value={elements.find(el => el.id === selectedId)?.font_color || '#000000'}
                  onChange={(e) => updateElementStyling(selectedId, { font_color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border)] overflow-hidden"
                  title="Font Color"
                  style={{ padding: 0 }}
                />
              </div>
            </div>
          )}

          {selectedId && (
            <button
              onClick={() => deleteElement(selectedId)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="flex-1 bg-[var(--background)] overflow-auto relative"
        style={{ 
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="min-h-full min-w-full relative p-8">
          {elements.map((element) => (
            <div
              key={element.id}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onDoubleClick={() => handleDoubleClick(element.id)}
              className={`absolute rounded-xl overflow-hidden transition-shadow ${
                selectedId === element.id 
                  ? 'ring-2 ring-violet-500 shadow-xl' 
                  : 'hover:ring-2 hover:ring-violet-500/50 shadow-lg'
              } ${dragState.isDragging && dragState.elementId === element.id ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{
                left: element.position_x,
                top: element.position_y,
                width: element.width,
                height: element.height,
                zIndex: element.z_index || 0,
                backgroundColor: element.background_color || (element.element_type === 'text' ? 'var(--card)' : 'transparent'),
              }}
            >
              {element.element_type === 'text' ? (
                editingId === element.id ? (
                  <textarea
                    autoFocus
                    defaultValue={element.content}
                    onBlur={(e) => {
                      updateElementContent(element.id, e.target.value);
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full h-full p-4 bg-transparent border-none outline-none resize-none"
                    style={{
                      fontSize: element.font_size || 16,
                      fontWeight: element.font_weight || 'normal',
                      fontFamily: element.font_family || 'Inter',
                      color: element.font_color || 'var(--foreground)',
                      textAlign: (element.text_align as any) || 'left',
                    }}
                  />
                ) : (
                  <div 
                    className="w-full h-full p-4 overflow-auto"
                    style={{
                      fontSize: element.font_size || 16,
                      fontWeight: element.font_weight || 'normal',
                      fontFamily: element.font_family || 'Inter',
                      color: element.font_color || 'var(--foreground)',
                      textAlign: (element.text_align as any) || 'left',
                    }}
                  >
                    {element.content || 'Double-click to edit'}
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]">
                  {element.content ? (
                    <img 
                      src={element.content} 
                      alt="Note image" 
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 text-[var(--muted)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Paste image URL"
                        className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                        onBlur={(e) => updateElementContent(element.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Resize handle */}
              {selectedId === element.id && (
                <div
                  onMouseDown={(e) => handleResizeStart(e, element.id)}
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-violet-500 rounded-tl-lg"
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 14.5L14.5 5.5M8.5 14.5L14.5 8.5M11.5 14.5L14.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </svg>
                </div>
              )}
            </div>
          ))}

          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-[var(--card)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                  <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Start Creating</h3>
                <p className="text-[var(--muted)] mb-6">Add text or image elements using the toolbar above</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => addElement('text')}
                    className="px-5 py-2.5 bg-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                    Add Text
                  </button>
                  <button
                    onClick={() => addElement('image')}
                    className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

