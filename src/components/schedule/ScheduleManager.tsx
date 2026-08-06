import React, { useState } from 'react';
import { X, Plus, Copy, Trash2, Edit3, Star, Download, Check } from 'lucide-react';
import { SavedSchedule } from '../../types/academic';
import { StorageUtils } from '../../utils/storageUtils';

interface ScheduleManagerProps {
  isOpen: boolean;
  schedules: SavedSchedule[];
  activeScheduleId: string | null;
  onClose: () => void;
  onSelectSchedule: (id: string) => void;
  onCreateSchedule: (name: string) => void;
  onRenameSchedule: (id: string, newName: string) => void;
  onDuplicateSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  isOpen,
  schedules,
  activeScheduleId,
  onClose,
  onSelectSchedule,
  onCreateSchedule,
  onRenameSchedule,
  onDuplicateSchedule,
  onDeleteSchedule
}) => {
  const [newScheduleName, setNewScheduleName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleName.trim()) return;
    onCreateSchedule(newScheduleName.trim());
    setNewScheduleName('');
  };

  const handleStartRename = (sched: SavedSchedule) => {
    setEditingId(sched.id);
    setEditingName(sched.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRenameSchedule(id, editingName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Mis Horarios Guardados</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Form */}
        <form onSubmit={handleCreate} className="my-3.5 flex items-center space-x-2 flex-shrink-0">
          <input
            type="text"
            value={newScheduleName}
            onChange={(e) => setNewScheduleName(e.target.value)}
            placeholder="Nombre del horario (ej: Opción Mañana)..."
            className="flex-grow px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-molinero-600"
          />
          <button
            type="submit"
            className="bg-molinero-700 hover:bg-molinero-800 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Crear</span>
          </button>
        </form>

        {/* Schedules List */}
        <div className="overflow-y-auto flex-grow space-y-2.5 pr-1 custom-scrollbar my-2">
          {schedules.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">No tienes horarios guardados.</p>
          ) : (
            schedules.map(sched => {
              const isActive = sched.id === activeScheduleId;

              return (
                <div
                  key={sched.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-molinero-50 border-molinero-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onSelectSchedule(sched.id)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isActive ? 'bg-molinero-600 border-molinero-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                    </button>

                    <div>
                      {editingId === sched.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(sched.id)}
                            className="text-xs bg-molinero-600 text-white px-2 py-1 rounded"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h3
                            onClick={() => onSelectSchedule(sched.id)}
                            className="font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:underline"
                          >
                            {sched.name}
                          </h3>
                          {sched.isPrimary && (
                            <span title="Horario principal">
                              <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        {sched.selectedSections.length} cursos • Periodo {sched.period}
                      </p>
                    </div>
                  </div>

                  {/* Item Action Icons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartRename(sched)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-white"
                      title="Renombrar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDuplicateSchedule(sched.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-white"
                      title="Duplicar"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => StorageUtils.exportScheduleToJson(sched)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded hover:bg-white"
                      title="Exportar archivo JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {schedules.length > 1 && (
                      <button
                        onClick={() => onDeleteSchedule(sched.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-molinero-700 hover:bg-molinero-800 text-white text-xs sm:text-sm font-bold rounded-xl"
          >
            Listo
          </button>
        </div>

      </div>
    </div>
  );
};
